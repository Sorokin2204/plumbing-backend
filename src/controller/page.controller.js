const db = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { CustomError, TypeError } = require('../models/customError.model');
const moment = require('moment/moment');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mailService = require('../services/mail-service');
const { currencyFormat } = require('../utils/currencyFormat');
const Page = db.page;
const PageContent = db.pageContent;
const PageContentToPage = db.pageContentToPage;

class PageController {
  async uploadFile(req, res) {
    if (!req.files) {
      res.send({
        status: 'failed',
      });
    } else {
      let file = req.files.file;
      const newUuid = uuidv4();
      const newFileName = `${newUuid}.${getFileExt(file.name)}`;
      file.mv('./public/files/' + newFileName);
      res.send({
        status: 'success',
        path: newFileName,
      });
    }
  }

  async deletePage(req, res) {
    const { deleteId } = req.body;
    await Page.update(
      { active: false },
      {
        where: {
          id: deleteId,
        },
      },
    );
    res.json({ succes: 'ok' });
  }
  async verify(req, res) {
    const authHeader = req.headers['request_token'];
    if (!authHeader) {
      throw new CustomError();
    }
    const tokenData = jwt.verify(authHeader, process.env.SECRET_TOKEN, (err, tokenData) => {
      if (err) {
        throw new CustomError();
      }
      return tokenData;
    });
    res.json({ success: 'true' });
  }
  async login(req, res) {
    const { login, password } = req.body;

    const passCheck = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
    const loginCheck = await bcrypt.compare(login, process.env.ADMIN_LOGIN);
    if (!passCheck || !loginCheck) {
      throw new CustomError();
    }

    const token = jwt.sign({}, process.env.SECRET_TOKEN, { expiresIn: '365d' });
    res.json({ token });
  }

  async searchPages(req, res) {
    const { search } = req.query;
    const findPages = await Page.findAll({
      where: {
        active: true,
        name: { [Op.like]: `%${search}%` },
      },
    });
    res.json(findPages);
  }
  async sendFormToEmail(req, res) {
    const { type, name, address, email, text, phone, services } = req.body;
    let dataMail;
    if (type === 'feedback') {
      dataMail = {
        title: 'Интернет прёмная',
        text: `
      <div style='color:#000'>
      <p>Ф.И.О: ${name}</p>
      <p>Адрес: ${address}</p>
      <p>Телефон: ${phone}</p>
      <p>Email: ${email}</p>
      <p>Текст письма: ${text}</p>
      </div>
      `,
      };
    } else if (type === 'checkout') {
      dataMail = {
        title: 'Оформление услуг',
        text: `
      <div style='color:#000'>
      <p><b>Услуги</b>:</p>
      ${services
        ?.map((itemService) => `<p>${itemService?.label}</p>`)
        .toString()
        .replaceAll(',', '')}
      <p>Ф.И.О: ${name}</p>
      <p>Адрес: ${address}</p>
      <p>Телефон: ${phone}</p>
      <p>Сумма: ${currencyFormat(services?.reduce((partialSum, a) => partialSum + a.value, 0))}</p>
      <p>Текст письма: ${text}</p>
      </div>
      `,
      };
    }

    await mailService.sendActivationMail(process.env.SMTP_MAIL, dataMail.text, dataMail.title);
    res.json({ success: true });
  }

  async getServiceList(req, res) {
    const findServiceList = await PageContent.findAll({ where: { isServiceTable: true, active: true } });
    const result = findServiceList?.map((itemServiceTable) => {
      const tableParse = JSON.parse(itemServiceTable?.data);
      return { id: itemServiceTable?.id, data: tableParse.data };
    });
    res.json(result);
  }

  async getPageForms(req, res) {
    const findPageFormPay = await Page.findOne({ where: { type: 'page', active: true, isFormPay: true } });
    const findPageFormCheckout = await Page.findOne({
      where: {
        type: 'page',
        active: true,
        isFormCheckout: true,
      },
    });
    const findPageFormFeedback = await Page.findOne({ where: { type: 'page', active: true, isFormFeedback: true } });
    res.json({
      pageFormPay: findPageFormPay,
      pageFormCheckout: findPageFormCheckout,
      pageFormFeedback: findPageFormFeedback,
    });
  }
  async getPages(req, res) {
    const { type, isBreakingNews, isDocsNews, limit } = req.query;
    const findPages = await Page.findAll({
      where: {
        type,
        active: true,
        ...(isBreakingNews && { newsIsBreaking: true }),
        ...(isDocsNews && { newsIsDocs: true }),
      },

      ...((isBreakingNews || isDocsNews || limit) && { limit: 3 }),
      order: [['newsDate', 'DESC']],
    });
    res.json(findPages);
  }
  async getPageSingle(req, res) {
    const { type, slug } = req.query;
    let findPageSingle = await Page.findOne({
      where: {
        type,
        slug,
      },
      include: {
        where: {
          active: true,
        },
        model: PageContent,
        required: false,
      },
    });
    if (!findPageSingle) {
      throw new CustomError();
    }
    findPageSingle = findPageSingle.toJSON();
    for (let pageContentItem of findPageSingle?.pageContents) {
      const findTabSingles = await PageContent.findAll({
        where: {
          active: true,
          tabId: pageContentItem?.id,
        },
        raw: true,
      });
      for (let tabSingleItem of findTabSingles) {
        const findTabContents = await PageContent.findAll({
          where: {
            active: true,
            tabId: tabSingleItem?.id,
          },
          raw: true,
        });
        tabSingleItem.childs = findTabContents;
      }

      pageContentItem.childs = findTabSingles;
    }
    res.json(formatPage(findPageSingle));
  }
  async createPage(req, res) {
    const { pageContent } = req.body;

    const pageId = await createPage(req.body);
    const pageContentIds = await createPageContent(pageContent);
    await createPageContentRelation(pageContentIds, pageId);
    res.json({ success: true });
  }
}
function getFileExt(name) {
  return /(?:\.([^.]+))?$/.exec(name)[1];
}
async function createPageContentRelation(pageContentIds, pageId) {
  const pageContentRelationData = [];
  for (let pageContentId of pageContentIds) {
    pageContentRelationData.push({ pageId, pageContentId });
  }
  await PageContentToPage.bulkCreate(pageContentRelationData);
}
async function createPageContent(pageContent, tabId = null) {
  let itemContentOrder = 0;
  let pageContentData = [];
  for (let itemContent of pageContent) {
    if (!(itemContent?.deleted && !itemContent?.pageContentId)) {
      itemContent.order = itemContentOrder;
      itemContent.tabId = tabId;
      const createdPageContentId = await pageContentDto(itemContent);
      pageContentData.push(createdPageContentId);
      itemContentOrder++;
    }
  }

  return pageContentData;
}
async function pageContentDto(content) {
  switch (content.type) {
    case 'editor':
      return await editorContentDto(content);
    case 'files':
      return await filesContentDto(content);
    case 'table':
      return await tableContentDto(content);
    case 'tabs':
      return await tabsContentDto(content);
    default:
      break;
  }
}

async function tabsContentDto({ type, order, value, pageContentId, deleted }) {
  const tabsData = { type, order, data: '', id: pageContentId, active: !!!deleted };
  const createdTabsContent = await createTabsContentDto(tabsData);
  let typeOrder = 0;
  let notDeletedTabs = [];
  for (let tab of value) {
    const tabData = { id: tab?.pageContentId, type: 'tab', order: typeOrder, data: tab.name, tabId: createdTabsContent, active: !!!tab?.deleted };
    const createdTabSingleContent = await createTabSingleContentDto(tabData);
    await createPageContent(tab.content, createdTabSingleContent);

    notDeletedTabs.push(createdTabSingleContent);

    typeOrder++;
  }
  if (pageContentId) {
    await PageContent.update(
      { active: false },
      {
        where: {
          type: 'tab',
          id: { [Op.notIn]: notDeletedTabs },
          tabId: pageContentId,
        },
      },
    );
  }
  return createdTabsContent;
}

async function createTabsContentDto({ type, order, data, id, active }) {
  const [upsertTabs, created] = await PageContent.upsert({ id, type, order, data, active });
  return upsertTabs.id;
}
async function createTabSingleContentDto({ id, type, order, data, tabId, active }) {
  const [upsertTab, created] = await PageContent.upsert({ id, type, order, data, tabId, active });
  return upsertTab.id;
}

async function editorContentDto({ type, order, value, tabId, pageContentId, deleted }) {
  const [upsertEditor, created] = await PageContent.upsert({ id: pageContentId, type, order, data: value.replaceAll('<p><br></p>', ''), tabId, active: !!!deleted });
  return upsertEditor.id;
}
async function filesContentDto({ type, order, value, tabId, pageContentId, deleted }) {
  const [upsertFiles, created] = await PageContent.upsert({ id: pageContentId, type, order, data: JSON.stringify(value), tabId, active: !!!deleted });
  return upsertFiles.id;
}
async function tableContentDto({ type, order, value, tabId, pageContentId, deleted }) {
  const [upsertTable, created] = await PageContent.upsert({ id: pageContentId, type, order, data: JSON.stringify(value).replaceAll('<p><br></p>', ''), isServiceTable: value?.isServiceTable, tabId, active: !!!deleted });
  return upsertTable.id;
}
function formatPage(pageData) {
  let formatedPageData = {
    newsDesc: pageData?.newsDesc,
    map: pageData?.homeMap ? JSON.parse(pageData?.homeMap) : null,
    list: pageData?.homeList ? JSON.parse(pageData?.homeList) : null,
    name: pageData.name,
    slug: pageData.slug,
    pageId: pageData.id,
    isBreakingNews: pageData.newsIsBreaking,
    isDocsNews: pageData.newsIsDocs,
    isFormPay: pageData?.isFormPay,
    isFormCheckout: pageData?.isFormCheckout,
    isFormFeedback: pageData?.isFormFeedback,
    dateNews: moment(pageData.newsDate).format('YYYY-MM-DD'),
    type: pageData?.type,
  };
  formatedPageData.pageContent = pageData?.pageContents?.map((childItem) => {
    return formatPageContent(childItem);
  });
  return formatedPageData;
}

function formatPageContent(pageContent) {
  let formatedPageContent = {
    pageContentId: pageContent.id,
    type: pageContent.type,
  };
  switch (pageContent.type) {
    case 'editor':
      formatedPageContent.value = pageContent.data;
      break;
    case 'files':
      formatedPageContent.value = pageContent.data ? JSON.parse(pageContent.data) : '';
      break;
    case 'table':
      formatedPageContent.value = pageContent.data ? JSON.parse(pageContent.data) : '';
      break;
    case 'tabs':
      formatedPageContent.value = pageContent.childs?.map((tabItem) => {
        let formatedTabContent = { name: tabItem?.data, pageContentId: tabItem.id };
        formatedTabContent.content = tabItem?.childs?.map((tabChildItem) => formatPageContent(tabChildItem));

        return formatedTabContent;
      });
      break;
    default:
      break;
  }

  return formatedPageContent;
}
async function createPage({ name, slug, type, dateNews, isBreakingNews, pageId, list, map, newsDesc, isDocsNews }) {
  const [upsertPage, created] = await Page.upsert({ newsDesc, id: pageId, name, slug, type, newsIsBreaking: isBreakingNews, newsIsDocs: isDocsNews, homeMap: map ? JSON.stringify(map) : null, homeList: list ? JSON.stringify(list) : null, newsDate: dateNews });
  return upsertPage.id;
}
module.exports = new PageController();

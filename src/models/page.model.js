module.exports = (sequelize, Sequelize) => {
  const Page = sequelize.define('page', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    newsIsBreaking: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    newsIsDocs: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    newsDate: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    },
    homeMap: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    },
    homeList: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      defaultValue: null,
    },
    newsDesc: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      defaultValue: null,
    },
    isFormPay: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isFormCheckout: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isFormFeedback: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isServicePage: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
  return Page;
};

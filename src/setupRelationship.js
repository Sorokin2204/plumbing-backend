const setupRelationship = (db) => {
  db.page.belongsToMany(db.pageContent, { through: { model: db.pageContentToPage, unique: false }, foreignKey: 'pageId' });
  db.pageContent.belongsToMany(db.page, { through: { model: db.pageContentToPage, unique: false }, foreignKey: 'pageContentId' });

  // db.pageContentToPage.belongsTo(db.homeTabs);
  // db.homeTabs.hasMany(db.pageContentToPage);
};

module.exports = setupRelationship;

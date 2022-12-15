module.exports = (sequelize, Sequelize) => {
  const PageContentToPage = sequelize.define('pageContentToPage', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
  return PageContentToPage;
};

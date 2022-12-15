module.exports = (sequelize, Sequelize) => {
  const TabContent = sequelize.define('tabContent', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
  return TabContent;
};

module.exports = (sequelize, Sequelize) => {
  const PageContent = sequelize.define('pageContent', {
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    data: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
      defaultValue: null,
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    tabId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    isServiceTable: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
  return PageContent;
};

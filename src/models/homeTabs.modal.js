module.exports = (sequelize, Sequelize) => {
  const HomeTabs = sequelize.define('homeTabs', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    data: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  });
  return HomeTabs;
};

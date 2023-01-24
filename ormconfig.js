const AdminUser = require('nestjs-admin').AdminUserEntity;

module.exports = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: 'postgres',
  password: process.env.DATABASE_PASSWORD,
  entities: ['dist/**/*.entity.js', AdminUser],
  migrations: ['dist/src/migrations/*.js'],
  cli: {
    migrationsDir: 'dist/src/migrations',
  },
  autoLoadEntities: true,
  synchronize: false,
  keepConnectionAlive: true,
};

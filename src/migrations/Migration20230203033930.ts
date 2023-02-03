import { Migration } from '@mikro-orm/migrations';

export class Migration20230203033930 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists "dummy" cascade;');

    this.addSql('alter table "post" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "post" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
  }

  async down(): Promise<void> {
    this.addSql('create table "dummy" ("title" varchar null default null, "description" varchar null default null);');

    this.addSql('alter table "post" alter column "created_at" type date using ("created_at"::date);');
    this.addSql('alter table "post" alter column "updated_at" type date using ("updated_at"::date);');
  }

}

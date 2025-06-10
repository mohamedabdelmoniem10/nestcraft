import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Category } from "./category.entity";
import { Tag } from "./tag.entity";

@Entity("blog_posts")
export class Post {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column("text")
  content: string;

  @Column("text", { nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  featuredImage: string;

  @Column({ default: "draft" })
  status: string; // draft, published, archived

  @Column({ default: 0 })
  viewCount: number;

  @ManyToOne(() => Category, (category) => category.posts)
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable()
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

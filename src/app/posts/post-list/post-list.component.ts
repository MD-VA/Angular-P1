import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

 posts: Post[] = [];
 loading: boolean = true;
 totalPost: number = 0;
 postPerPage: number = 2;
 pageSize: number[] = [1, 2, 5, 10];
 currentPage: number = 1;
 private postSub!: Subscription;

  constructor(public postsService: PostService) {

  }

  ngOnInit(): void {
    this.postsService.getPosts(this.postPerPage, this.currentPage);
    this.postSub = this.postsService.getPostsUpdateListener().subscribe((postData:{posts: Post[], postCount: number}) => {
      this.posts = postData.posts;
      this.totalPost = postData.postCount;
      this.loading = false;
    });
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.postSub.unsubscribe();
  }
  onDelete(id: string){
    this.postsService.deletePost(id).subscribe(()=> {
      this.postsService.getPosts(this.postPerPage, this.currentPage);
    });
  }

  onChangePage(pageData: PageEvent){
    // console.log(pageData);
    this.loading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
  }
}

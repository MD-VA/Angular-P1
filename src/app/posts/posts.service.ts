import { Injectable } from '@angular/core';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class PostService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{posts:Post[], postCount: number}>()

    constructor(private http: HttpClient, private router: Router){

    }

    getPosts(postPerPage: number, currentPage: number){
        const queryParams = `?pageSize=${postPerPage}&&currentPage=${currentPage}`;
        this.http.get<{message: string, posts: any, postCount: number}>('http://localhost:3000/api/posts' + queryParams)
            .pipe(map((postData) =>{
                return {
                    posts : postData.posts.map((post: any) => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id,
                        imagePath: post.imagePath
                    }
                }), 
                maxPost: postData.postCount
            }
            }))
            .subscribe((transformedPosts)=> { 
                this.posts = transformedPosts.posts;
                this.postsUpdated.next({posts: [...this.posts], postCount: transformedPosts.maxPost});
            });
    }

    getPostsUpdateListener(){
        return this.postsUpdated.asObservable();
    }

    getPost(postId:string){
        return this.http.get<{message: string, post: {_id:string, title:string, content:string, imagePath: string}}>(`http://localhost:3000/api/posts/${postId}`);
    }

    addPost(title: string, content: string, image: File){
        const postData = new FormData();
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title);


        this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData).subscribe((responseData)=> {
        console.log(responseData.message, 'message data');
        })
    }

    deletePost(postId:string){
        return this.http.delete<{message: string}>(`http://localhost:3000/api/posts/${postId}`)
    }

    updatePost(postId: string, title: string, content: string, image: File | string){
        let postData : Post | FormData;
        if (typeof(image) === "object") {
            postData = new FormData()
            postData.append("id", postId)
            postData.append("title", title),
            postData.append("content", content),
            postData.append("image", image, title)
        } else{
            postData = {id: postId, title: title, content, imagePath: image};
        }
        this.http.put(`http://localhost:3000/api/posts/${postId}`, postData).subscribe((response)=>{
            console.log(response);
        })
       
    }
}
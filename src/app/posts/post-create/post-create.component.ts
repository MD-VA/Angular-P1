import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { from } from 'rxjs';
import { Post } from '../post.model';
import { PostService } from '../posts.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {

  newPost = 'now content';
  enteredContent = '';
  enteredTitle = '';
  private mode =  'create';
  private postId: any;
  isLoading = false;
  post?: Post;
  form!: FormGroup;
  imagePreview!: string;
  // postCreated = new EventEmitter<Post>();
  // @Output() alert = new EventEmitter();

  constructor(public postService: PostService, private route: ActivatedRoute,private router: Router) { 
  
  }

  ngOnInit() {
    this.form = new FormGroup({
      'title':new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, {
        validators: [Validators.required]
      }),
      'image': new FormControl(null, {validators: [Validators.required], asyncValidators:[mimeType]})
    })

    
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.postService.getPost(this.postId).subscribe(responseData =>{
          this.post = {id: responseData.post._id, title: responseData.post.title, content: responseData.post.content, imagePath: responseData.post.imagePath};
          this.form.setValue({
            'title': this.post.title, 
            'content': this.post.content,
            'image': this.post.imagePath
          })
        });
        } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }


  onAddPost(){
    console.log('add a post');
    if(this.form.get('title')?.invalid || this.form.get('content')?.invalid){
      return;
    }
    console.log('form ivalid');
    if (this.mode === 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content , this.form.value.image);
    }else if (this.mode === 'edit'){
      console.log('update post');
      this.postService.updatePost(this.postId,this.form.value.title, this.form.value.content,  this.form.value.image);
    }
    this.form.reset();
    this.router.navigate(['/']);
  }

  

  
  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.form.patchValue({image: file});
    this.form.get('image')!.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

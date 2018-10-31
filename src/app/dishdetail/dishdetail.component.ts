import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { visibility, flyInOut, expand } from '../animations/app.animation';
import { FavoriteService } from '../services/favorite.service';
import { Favorite } from '../shared/favorite';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    visibility(), 
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;
  dishcopy: Dish;
  favorite: boolean = false;

  favorites: Favorite;
  delete: boolean;

  visibility = 'shown';

  commentForm: FormGroup;
  comment: Comment;
  @ViewChild('fform') commentFormDirective;

  formErrors = {
    'author': '',
    'comment': '',
  };

  validationMessages = {
    'author': {
      'required': 'Author Name is required.',
      'minlength': 'Author Name must be at least 2 characters long.',
      'maxlength': 'Author Name cannot be more than 25 characters long.',
    },
    'comment': {
      'required': 'Comment is required.',
    }
  };

  constructor(
    private dishService: DishService,
    private favoriteService: FavoriteService,
    private route: ActivatedRoute, 
    private location: Location, 
    private cmnt: FormBuilder,
    @Inject('BaseURL') private BaseURL) { }

  ngOnInit() {

    this.createForm();

    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => {this.visibility = 'hidden'; return this.dishService.getDish(params['id']); }))
      .subscribe(dish => {this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish._id); this.visibility = 'shown'; },
        errmess => this.errMess = <any>errmess );
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.cmnt.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      comment: ['', [Validators.required]],
      rating: 5
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); //(re)set form validation messages 
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous erroe message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    
    // converting the date to string type 
    var date = new Date();
    var dateToString = date.toString();

    // adding the date to the comment
    this.comment.date = dateToString;
    console.log(this.comment)
    // adding the comment to the array 
    this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish;
        this.dishcopy = dish;
      },
        errmess => { 
          this.dish = null; 
          this.dishcopy = null;
          this.errMess = <any>errmess; 
        }
      );
    this.commentForm.reset({
      author: '',
      comment: '',
      rating: 5
    });
    this.commentFormDirective.resetForm();
  }

  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }

    if (value > 5) {
      return Math.round(value / 5);
    }
    return value;
  }

  addToFavorites() {
    if (!this.favorite) {
      console.log("Add to Favorites");
      this.favoriteService.postFavorite(this.dish._id)
        .subscribe(favorites => { console.log(favorites); this.favorite = true; });
    }
  }

  deleteFavorite() {
    if (this.favorite) {
      console.log("Deleting Dish " + this.dish._id + " from your favorites");
      this.favoriteService.deleteFavorite(this.dish._id)
      .subscribe(favorites => { console.log(favorites); this.favorites = favorites; },
        errmess => this.errMess = <any>errmess);
        this.delete = false;
    }
  }

}

import { Injectable } from '@angular/core';
import { Favorite } from '../shared/favorite';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { baseURL } from '../shared/baseurl';
import { ProcessHTTPMsgService } from './process-httpmsg.service';

@Injectable()
export class FavoriteService {

  constructor(private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService) { }

  getFavorites(): Observable<Favorite> {
    return this.http.get<Favorite>(baseURL + 'favorites')
      .pipe(catchError(this.processHTTPMsgService.handlError));
  }

  postFavorites(dishids: any) {
    return this.http.post(baseURL + 'favorites/', dishids)
      .pipe(catchError(this.processHTTPMsgService.handlError));
  }

  isFavorite(id: string) {
    return this.http.get(baseURL + 'favorites/' + id)
      .pipe(catchError(this.processHTTPMsgService.handlError));   
  }

  postFavorite(id: string) {
    return this.http.post(baseURL + 'favorites/' + id, {})
      .pipe(catchError(this.processHTTPMsgService.handlError));
  }

  deleteFavorite(id: string) {
    return this.http.delete<Favorite>(baseURL + 'favorites/' + id)
      .pipe(catchError(this.processHTTPMsgService.handlError));
  }
}

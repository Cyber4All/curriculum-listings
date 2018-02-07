import { PUBLIC_LEARNING_OBJECT_ROUTES } from './../environments/route';
import { ConfigService } from './config.service';
import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as Fuse from 'fuse.js';
import { environment } from '../environments/environment';
import { LearningObject, User } from '@cyber4all/clark-entity';
<<<<<<< HEAD
=======
import { Query, TextQuery, MappingQuery } from './shared/interfaces/query';

>>>>>>> 1e1a6100459b4837e1cbf22802f8ac70ea968fe1
import * as querystring from 'querystring';

@Injectable()
export class LearningObjectService {

  fuse;
  filteredResults;
  dataObserver;
  data;

  public totalLearningObjects: number;

  constructor(private config: ConfigService, private http: Http, ) { }

  observeFiltered(): Observable<LearningObject[]> {
    return this.data;
  }

<<<<<<< HEAD
  async configureFuse(query:String){
    let fuseGroups = await this.getLearningObjects();
    let options = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name']
    };
    this.fuse = new Fuse(fuseGroups, options)



  }

  async search(query: String): Promise<LearningObject[]>{
    if(query.length < 4){
      this.clearSearch();
    }else {
      await this.configureFuse(query);
      this.filteredResults = this.fuse.search(query);
    }
    return this.filteredResults;
  }

  getFilteredObjects(){
=======
  getFilteredObjects() {
>>>>>>> 1e1a6100459b4837e1cbf22802f8ac70ea968fe1
    return this.filteredResults;
  }

  clearSearch() {
    this.filteredResults = [];
  }

  openLearningObject(url: string) {
    window.open(url);
  }

 /**
   * Fetches Array of Learning Objects
   * 
   * @returns {Promise<LearningObject[]>} 
   * @memberof LearningObjectService
   */
  // TODO: Remove limit
<<<<<<< HEAD
  getLearningObjects(query?: any, featured?: number): Promise<LearningObject[]> {
=======
  getLearningObjects(query?: Query): Promise<LearningObject[]> {
>>>>>>> 1e1a6100459b4837e1cbf22802f8ac70ea968fe1
    let route = '';
    if (query) {
      let queryString = querystring.stringify(query);
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS_WITH_FILTER(queryString)
    } else {
      route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECTS;
    }
    return this.http.get(route)
      .toPromise()
      .then((response) => {
        let res = response.json();
        let objects = res.objects;
<<<<<<< HEAD
        let total = res.total;
=======
        this.totalLearningObjects = res.total;
>>>>>>> 1e1a6100459b4837e1cbf22802f8ac70ea968fe1
        return objects.map((_learningObject: string) => {
          let learningObject = LearningObject.unserialize(_learningObject);
          return learningObject;
        });
      });
  }


  /**
   * Fetches LearningObject by id
   * 
   * @param {string} id 
   * @returns {Promise<LearningObject>} 
   * @memberof LearningObjectService
   */
  getLearningObject(author: string, learningObjectName: string): Promise<LearningObject> {
    let route = PUBLIC_LEARNING_OBJECT_ROUTES.GET_PUBLIC_LEARNING_OBJECT(author, learningObjectName);
    return this.http.get(route)
      .toPromise()
      .then((learningObject) => {
        return learningObject ? LearningObject.unserialize(learningObject.json().object) : null;
      });
  }

}

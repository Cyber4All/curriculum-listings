import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TopicService {

  constructor(private http: HttpClient) { }


  /**
   * Get ratings for a learning object
   *
   * @param {string} CUID
   * @param {string} version
   * @returns {Promise<any>}
   */
  getLearningObjectTopics(): Promise<any> {
    return this.http
      .get('http://localhost:9001/metadata', { withCredentials: true }).toPromise();
  }

}


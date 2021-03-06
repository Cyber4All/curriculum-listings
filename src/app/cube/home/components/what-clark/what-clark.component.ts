import { Component, OnInit } from '@angular/core';
import { COPY } from '../../home.copy';

@Component({
  selector: 'cube-what-clark',
  templateUrl: './what-clark.component.html',
  styleUrls: ['./what-clark.component.scss']
})
export class WhatClarkComponent implements OnInit {

  copy = COPY;

  openVideoModal = false;
  constructor() { }

  ngOnInit(): void {
  }


  openModal() {
    this.openVideoModal = true;
  }

  closeModal() {
    this.openVideoModal = false;
  }

}

import { ModalService } from './modal.service';
import { Component, Output, Input, ElementRef, EventEmitter, DoCheck, AfterViewChecked} from '@angular/core';
import { Modal } from './modal';

@Component({
    selector: '<app-contextmenu></app-contextmenu>',
    template: `
    <div *ngIf="show" class="popup " [attr.class]="'popup ' + content.classes" [ngStyle]="{'left': this.x, 'top': this.y}" (clickOutside)="tryClose($event)">
        <ul>
            <li *ngFor="let l of content['list']" (click)="!l.checkbox && optionClick($event, l.func)" [ngClass]="l.classes ? l.classes : ''">
                <checkbox *ngIf="l.checkbox" [func]='l.func' [checked]="content.checked.includes(l.func)" (action)="checkbox($event, val)"></checkbox>
                <span [innerHTML]="l.text"></span>
            </li>
        </ul>
    </div>
    `
})
export class ContextMenuComponent extends Modal implements DoCheck, AfterViewChecked {
    type: string = 'context';

    constructor(private elementRef: ElementRef, modalService: ModalService) {
        super(modalService);
    }
    
    checkbox(event, func) {
        this.optionClick(event, func, true);
    }

    ngAfterViewChecked() {
        super.ngAfterViewChecked();
        if (this.show) {
            // we're opening
            if (this.content.el) {
            // we passed an element
                this.calculatePosition(this.content.el);
            } else if (this.content.pos) {
                // we passed coordinates
                this.assignCoords(this.content.pos.x, this.content.pos.y);
            }
        }
    }

    /**
     * Takes an x and a y coordinate, checks that they're formatted correctly, and sets Modals x and y parameters to them.
     * @param x 
     * @param y 
     */
    private assignCoords(x, y) {
        this.x = (typeof x === 'number') ? x + 'px' : x;
        this.y = (typeof y === 'number') ? y + 'px' : y;
    }

    /**
     * Takes the passed element parameter and checks to ensure the modal will display on screen, and if not, moves it so that it will.
     * @param el 
     */
    private calculatePosition(el) {
        const offsetConst = 15;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const p = this.elementRef.nativeElement.querySelector('.popup');
        const x = (this.modalService.offset(el).left + p.offsetWidth + offsetConst < windowWidth) ? this.modalService.offset(el).left + offsetConst : this.modalService.offset(el).left - p.offsetWidth;
        const y = (this.modalService.offset(el).top + p.offsetHeight + offsetConst < windowHeight) ? this.modalService.offset(el).top + offsetConst : this.modalService.offset(el).top - p.offsetHeight;
        
        this.assignCoords(x, y);
    }
}
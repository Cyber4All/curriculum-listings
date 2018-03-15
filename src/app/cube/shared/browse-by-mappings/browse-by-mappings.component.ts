import { Component, OnInit, Output, Input, EventEmitter, AfterViewChecked, SimpleChanges, OnChanges } from '@angular/core';
import { ModalService, Position, ModalListElement } from '../../../shared/modals';
import { OutcomeService } from '../../core/services/outcome.service';

// RXJS
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { MappingsFilterService } from '../../../core/mappings-filter.service';

@Component({
  selector: 'browse-by-mappings-component',
  templateUrl: './browse-by-mappings.component.html',
  styleUrls: ['./browse-by-mappings.component.scss']
})
export class BrowseByMappingsComponent implements OnInit, OnChanges, AfterViewChecked {
  // Inputs
  @Input('dimensions') dimensions = {}; // should be of format {w?: number (in pixels), h?: number (in pixels)}

  // Outputs
  @Output('done') done = new EventEmitter<boolean>();

  // TODO: sources should be fetched from an API route to allow dynamic configuration
  sources = ['NCWF', 'CAE', 'CS2013'];

  mappingsQueryInProgress = false;

  // array of results (outcomes) from a query
  queriedMappings: any[] = [];

  // empty observable to be instantiated after the view is checked
  // will watch the input and query the database after user has stopped typing
  mappingsFilterInput: Observable<string>;

  mappingsQueryError = false;

  constructor(private modalService: ModalService, private outcomeService: OutcomeService, private mappingService: MappingsFilterService) { }

  ngOnInit() {
    // check if the service has filterText and author and conditionally populate component
    // if someone opens component, performs a query, closes the component, and then reopens the component
    if (this.mappingService.filterText && this.mappingService.author) {
      this.mappingsQueryInProgress = true;
      this.getOutcomes().then(() => {
        this.mappingsQueryInProgress = false;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // do nothing yet
  }

  ngAfterViewChecked() {
    // instantiate observable to watch input and fire events when user stops typing
    if (!this.mappingsFilterInput) {
      this.mappingsFilterInput = Observable
        .fromEvent(document.getElementById('mappingsFilter'), 'input')
        .map(x => x['currentTarget'].value).debounceTime(650);

        // listen for user to stop typing in the text input and perform query
      this.mappingsFilterInput.subscribe(val => {
        if (this.mappingService.author && this.mappingService.author !== '') {
          this.mappingsQueryInProgress = true;
          this.getOutcomes().then(() => {
            this.mappingsQueryInProgress = false;
          });
        }
      });
    }
  }

  // emits from the close event emitter (useful if this component is in a modal)
  close() {
    this.done.emit(true);
  }

  // displays the sources dropdown contextmenu
  showSources(event) {
    this.modalService.makeContextMenu(
      'SourceContextMenu',
      'dropdown',
      this.sources.map(s => new ModalListElement(s, s, (s === this.mappingService.author) ? 'active' : undefined)),
      null,
      new Position(
        this.modalService.offset(event.currentTarget).left - (190 - event.currentTarget.offsetWidth),
        this.modalService.offset(event.currentTarget).top + 50))
      .subscribe(val => {
        if (val !== 'null') {
          this.mappingService.author = val;
          this.mappingsQueryInProgress = true;
          this.getOutcomes().then(() => {
            this.mappingsQueryInProgress = false;
          });
        }
      });
  }

  // queries database with author and filterText
  getOutcomes(): Promise<void> {
    this.mappingsQueryError = false;
    const filters = {
      filterText: this.mappingService.filterText,
      author: this.mappingService.author
    };
    return this.outcomeService.getOutcomes(filters).then(res => {
      this.queriedMappings = res;
      if (!this.queriedMappings.length && this.mappingService.filterText !== '') {
        this.mappingsQueryError = true;
      }
    });
  }

  // checks lists of outcomes for a specific outcome
  checkOutcomes(outcome): boolean {
    if (this.mappingService.hasMappings) {
      for (let i = 0; i < this.mappingService.mappings.length; i++) {
        if (this.mappingService.mappings[i]['id'] === outcome.id) {
          return true;
        }
      }
    }
    return false;
  }

  // adds an outcome to the list of selected outcomes
  addOutcome(outcome) {
    if (!this.checkOutcomes(outcome)) {
      const o = { id: outcome.id, name: outcome.name, source: this.mappingService.author, date: outcome.date, outcome: outcome.outcome };
      (<{ id: string, name: string, date: string, outcome: string }[]>this.mappingService.mappings).push(o);
    }
  }

  // removes an outcome from list of selected outcomes
  removeOutcome(outcome) {
    for (let i = 0; i < this.mappingService.mappings.length; i++) {
      if (this.mappingService.mappings[i]['id'] === outcome.id) {
        this.mappingService.mappings.splice(i, 1);
        return;
      }
    }
  }

  // truncates and appends an ellipsis to block of text based on maximum number of characters
  outcomeText(text: string, max: number = 150, margin: number = 10): string {
    let outcome = text.substring(0, max);
    const spaceAfter = text.substring(max).indexOf(' ') + outcome.length;
    const spaceBefore = outcome.lastIndexOf(' ');

    if (outcome.charAt(outcome.length - 1) === '.') {
      return outcome;
    } else if (outcome.charAt(outcome.length - 1) === ' ') {
      return outcome.substring(0, outcome.length - 1) + '...';
    }

    // otherwise we're in the middle of a word and should attempt to finsih the word before adding an ellpises
    if (spaceAfter - outcome.length - 1 <= margin) {
      outcome = text.substring(0, spaceAfter);
    } else {
      outcome = text.substring(0, spaceBefore);
    }

    return outcome.trim() + '...';
  }

}

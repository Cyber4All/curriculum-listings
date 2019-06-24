import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import { CollectionService, Collection } from 'app/core/collection.service';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';
import { ContextMenuService } from 'app/shared/contextmenu/contextmenu.service';
import { LearningObject } from '@entity';
import { ToasterService } from 'app/shared/toaster';

@Component({
  selector: 'clark-admin-filter-search',
  templateUrl: './filter-search.component.html',
  styleUrls: ['./filter-search.component.scss']
})
export class FilterSearchComponent implements OnInit {
  collections: Collection[] = [];
  isCollectionRestricted = false;
  filtersModified$: Subject<void> = new Subject();
  filters: Set<string> = new Set();
  statuses = Object.values(LearningObject.Status);

  private _selectedCollection: Collection;

  @Input() adminOrEditor: boolean;

  @Output() statusFilter = new EventEmitter<any[]>();
  @Output() collectionFilter = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput: ElementRef;

  filterMenu: string;
  filterMenuDown = false;
  collectionMenu: string;
  collectionMenuDown = false;

  constructor(
    private collectionService: CollectionService,
    private authService: AuthService,
    private contextMenuService: ContextMenuService,
    private toaster: ToasterService
  ) {}

  ngOnInit() {
    this.getCollections();
    this.findUserRestrictions();

    // add the 'all' option into the list of statuses
    this.statuses.splice(0, 0, 'All');

    this.statuses = this.statuses.filter(
      s => !['rejected', 'unreleased'].includes(s.toLowerCase())
    );
  }

  /**
   * Fetches the collections from the CollectionService and formats them for use in the context menu.
   */
  private getCollections(): void {
    this.collectionService
      .getCollections()
      .then(collections => {
        this.collections = Array.from(collections);
        this.collections.push({ abvName: 'all', name: 'All', hasLogo: false });

        this.collections.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      })
      .catch(error => {
        this.toaster.notify('Error!', error, 'bad', 'far fa-times');
        console.error(error);
      });
  }

  /**
   * Checks for user's authorization
   */
  private findUserRestrictions() {
    this.authService.user.accessGroups.forEach((group: string) => {
      if (group.includes('@')) {
        this.isCollectionRestricted = true;
      }
    });
  }

  /**
   * Set's the selected collection property to the full Collection object represented by the abbreviated name
   * @param { string } abvName abbreviated name of the collection
   */
  setSelectedCollection(abvName: string) {
    this._selectedCollection = this.collections.filter(
      x => x.abvName === abvName
    )[0];
  }

  /**
   * Return the currently selected collection
   *
   * @readonly
   * @type {Collection}
   * @memberof FilterSearchComponent
   */
  get selectedCollection(): Collection {
    return this._selectedCollection;
  }

  /**
   * Hide or show the filter dropdown menu
   * @param event {MouseEvent} the mouse event from clicking
   */
  toggleFilterMenu(event: MouseEvent) {
    if (this.filterMenu) {
      if (!this.filterMenuDown && event) {
        this.contextMenuService.open(
          this.filterMenu,
          event.currentTarget as HTMLElement,
          {
            top: 10,
            left:
              (event.currentTarget as HTMLElement).getBoundingClientRect()
                .width - 200
          }
        );
      } else {
        this.contextMenuService.destroy(this.filterMenu);
      }

      this.filterMenuDown = !!event;
    } else {
      console.error('Error! Attempted to use an unregistered context menu');
    }
  }

  /**
   * Hide or show the collection filter dropdown menu
   * @param event {MouseEvent} the event from clicking
   */
  toggleCollectionMenu(event: MouseEvent) {
    if (this.collectionMenu) {
      if (!this.collectionMenuDown && event) {
        this.contextMenuService.open(
          this.collectionMenu,
          event.currentTarget as HTMLElement,
          {
            top: 10,
            left:
              (event.currentTarget as HTMLElement).getBoundingClientRect()
                .width - 200
          }
        );
      } else {
        this.contextMenuService.destroy(this.collectionMenu);
      }

      this.collectionMenuDown = !!event;
    } else {
      console.error('Error! Attempted to use an unregistered context menu');
    }
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleStatusFilter(filter: string) {
    if (filter.toLowerCase() === 'all') {
      this.clearStatusFilters();
      this.toggleFilterMenu(undefined);
      return;
    }

    if (this.filters.has(filter)) {
      this.filters.delete(filter);
    } else {
      this.filters.add(filter);
    }
    this.statusFilter.emit(Array.from(this.filters));
  }

  /**
   * Add or remove filter from filters list
   * @param filter {string} the filter to be toggled
   */
  toggleCollectionFilter(filter: string) {
    if (filter.toLowerCase() === 'all') {
      this.clearCollectionFilters();
      this.toggleCollectionMenu(undefined);
      return;
    } else if (
      this.selectedCollection &&
      filter === this.selectedCollection.abvName
    ) {
      this.clearCollectionFilters();
    } else {
      this.setSelectedCollection(filter);
      this.collectionFilter.emit(filter);
    }
  }

  /**
   * Remove all applied status filters
   */
  clearStatusFilters() {
    this.filters.clear();
    this.statusFilter.emit([]);
  }

  /**
   * Remove any applied collection filters
   *
   * @memberof FilterSearchComponent
   */
  clearCollectionFilters() {
    this.setSelectedCollection(undefined);
    this.collectionFilter.emit(undefined);
  }

  /**
   * Remove all active status filters and collection filters
   *
   * @memberof FilterSearchComponent
   */
  clearAllFilters() {
    this.setSelectedCollection(undefined);
    this.filters.clear();
    this.clearAll.emit();
  }

  /**
   * Returns the correct icon for the given Learning Object status
   *
   * @param {string} status the status for which to return an icon
   * @returns {string}
   * @memberof FilterSearchComponent
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'unreleased':
        return 'far fa-eye-slash';
      case 'waiting':
        return 'far fa-hourglass';
      case 'review':
        return 'far fa-sync';
      case 'proofing':
        return 'far fa-shield';
      case 'released':
        return 'far fa-eye';
      case 'rejected':
        return 'far fa-ban';
    }
  }
}
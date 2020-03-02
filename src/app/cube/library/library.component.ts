import { Component, OnInit, OnDestroy, HostListener, OnChanges } from '@angular/core';
import { LibraryService } from 'app/core/library.service';
import { LearningObject } from 'entity/learning-object/learning-object';
import { ToastrOvenService } from 'app/shared/modules/toaster/notification.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user.service';
import { RatingService } from 'app/core/rating.service';
import { ChangelogService } from 'app/core/changelog.service';
import { LearningObjectService } from '../learning-object.service';

@Component({
  selector: 'clark-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit, OnDestroy, OnChanges {

  loading: boolean;
  serviceError: boolean;
  libraryItems: LearningObject[] = [];
  downloading = [];
  destroyed$ = new Subject<void>();
  canDownload = false;
  notifications: { text: string, timestamp: string, link: string, attributes: any }[];
  localNotifications: { text: string, timestamp: string, link: string, attributes: any }[] = [];
  notificationPages = {};
  notificationPageKeys = [];
  showDownloadModal = false;
  openChangelogModal = false;
  loadingChangelogs = false;
  showDeleteLibraryItemModal = false;
  changelogs = [];
  changelogLearningObject;
  libraryItemToDelete;
  lastPageNumber;
  currentPageNumber = 1;
  currentNotificationsPageNumber = 1;
  lastNotificationsPageNumber;
  // Notification Card variables
  mobile = false;
  notificationCardCount = 5;
  indexOfLastNotification = 0;


  constructor(
    public libraryService: LibraryService,
    private toaster: ToastrOvenService,
    private authService: AuthService,
    private router: Router,
    private user: UserService,
    private ratings: RatingService,
    private changelogService: ChangelogService,
    private learningObjectService: LearningObjectService,
  ) {
    this.getScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    const width = window.innerWidth;
    // Mobile devices
    if (width < 600) {
      this.mobile = true;
      this.notificationCardCount = 1;
      // Normal tablets
    } else if (width >= 600 && width < 800) {
      this.mobile = true;
      this.notificationCardCount = 2;
      // Larger tablets
    } else if (width >= 800 && width < 1000) {
      this.mobile = true;
      this.notificationCardCount = 3;
      // Smaller Desktops
    } else if (width >= 1000 && width < 1200) {
      this.mobile = false;
      this.notificationCardCount = 4;
      // Bigger Desktops
    } else if (width >= 1200) {
      this.mobile = false;
      this.notificationCardCount = 5;
    }
    console.log(this.notificationCardCount);
    this.getNotifications(this.currentNotificationsPageNumber);
  }

  ngOnInit() {
    this.loadLibrary();
    this.getScreenSize();
    this.getNotifications(this.currentNotificationsPageNumber);
  }

  ngOnChanges () {
    this.getScreenSize();
    this.getNotifications(this.currentNotificationsPageNumber);
  }

  async loadLibrary() {
    try {
      this.loading = true;
      const libraryItemInformation = await this.libraryService.getLibrary(this.currentPageNumber, 10);
      this.libraryItems = libraryItemInformation.cartItems;
      this.lastPageNumber = libraryItemInformation.lastPage;
      this.libraryItems.map(async (libraryItem: LearningObject) => {
        const ratings = await this.getRatings(libraryItem);
        if (ratings) {
          libraryItem['avgRating'] = ratings.avgValue;
        }
      });
      this.loading = false;
    } catch (e) {
      this.toaster.error('Error!', 'Unable to load your library. Please try again later.');
      this.serviceError = true;
      this.loading = false;
    }
  }

  async getNotifications(page: number) {
    // If this is a mobile device retrieve all the notifications at once so we don't have multiple requests to the backend. 
    if (this.mobile === true) {
      if (this.localNotifications.length <= 0) {
        const result = await this.user.getNotifications(this.authService.user.username, page, 1000);
        this.localNotifications = result.notifications;
        this.lastNotificationsPageNumber = Math.ceil(this.localNotifications.length / this.notificationCardCount);
        this.currentNotificationsPageNumber = page;
        console.log('count', this.notificationCardCount);
        this.notifications = this.localNotifications.slice(0, this.notificationCardCount);
      }
      if (page < this.currentNotificationsPageNumber) {
        if (this.indexOfLastNotification - this.notificationCardCount > 0) {
          this.notifications = this.localNotifications.slice(
            this.indexOfLastNotification - (2 * this.notificationCardCount), this.indexOfLastNotification - this.notificationCardCount
          );
          this.indexOfLastNotification = this.indexOfLastNotification - this.notificationCardCount;
        }
      } else {
        if (this.localNotifications.length >= (this.indexOfLastNotification + this.notificationCardCount)) {
          this.notifications = this.localNotifications.slice(
            this.indexOfLastNotification, this.indexOfLastNotification + this.notificationCardCount
          );
          this.indexOfLastNotification = this.indexOfLastNotification + this.notificationCardCount;
        } else {
          this.notifications = this.localNotifications.slice(this.indexOfLastNotification, this.localNotifications.length);
        }
      }
      this.currentNotificationsPageNumber = page;
      // If this is not a mobile device do incremental requests for notifications
    } else if (this.mobile === false) {
      if (this.localNotifications.length <= 0) {
        const result = await this.user.getNotifications(this.authService.user.username, page, 5);
        this.localNotifications = result.notifications;
        this.notifications = this.localNotifications.splice(0, this.notificationCardCount);
        this.lastNotificationsPageNumber = result.lastPage;
        console.log(this.notifications);
        this.currentNotificationsPageNumber = page;
      }
      if (page < this.currentNotificationsPageNumber) {
        if (this.indexOfLastNotification - this.notificationCardCount > 0) {
          this.notifications = this.localNotifications.slice(
            this.indexOfLastNotification - (2 * this.notificationCardCount), this.indexOfLastNotification - this.notificationCardCount
          );
          this.indexOfLastNotification = this.indexOfLastNotification - this.notificationCardCount;
        }
      // tslint:disable-next-line: max-line-length
      } else if (page > this.currentNotificationsPageNumber) {
        if (this.localNotifications.length >= (this.indexOfLastNotification + this.notificationCardCount)) {
          this.notifications = this.localNotifications.slice(
            this.indexOfLastNotification, this.indexOfLastNotification + this.notificationCardCount
          );
          this.indexOfLastNotification = this.indexOfLastNotification + this.notificationCardCount;
        } else if (this.localNotifications.length <= (this.indexOfLastNotification + this.notificationCardCount)) {
          const result = await this.user.getNotifications(this.authService.user.username, page, 5);
          this.localNotifications = this.localNotifications + result.notifications;
          this.currentNotificationsPageNumber = page;
        }
      }
    }
  }

  async deleteNotification(notification: any) {
    await this.user.deleteNotification(this.authService.user.username, notification.id);
    await this.getNotifications(this.currentPageNumber);
  }

  async removeItem() {
    try {
      await this.libraryService.removeFromLibrary(this.libraryItemToDelete.cuid);
      this.libraryItems = (await this.libraryService.getLibrary(1, 10)).cartItems;
      this.showDeleteLibraryItemModal = false;
    } catch (e) {
      console.log(e);
    }
  }

  downloadObject(event: MouseEvent, object: LearningObject, index: number) {
    event.stopPropagation();
    this.downloading[index] = true;
    this.libraryService.downloadLearningObject(
        object.author.username,
        object.cuid,
        object.version
      ).pipe(
      takeUntil(this.destroyed$))
      .subscribe(finished => {
        if (finished) {
          this.downloading[index] = false;
        }
      });

    this.showDownloadModal = true;
  }

  goToNotification(notification: any) {
    const parsedDetailsPath = notification.link.split('/');
    this.router.navigate(['/details/', parsedDetailsPath[2], parsedDetailsPath[3]]);
  }

  goToItem(object: LearningObject) {
    this.router.navigate(['/details/', object.author.username, object.cuid]);
  }

  async getRatings(learningObject: LearningObject) {
    const { author, cuid, version } = learningObject;
    const params = {
      username: author.username,
      CUID: cuid,
      version,
    };
    const ratings = await this.ratings.getLearningObjectRatings(params);
    return ratings;
  }

  toggleDownloadModal(val?: boolean) {
    this.showDownloadModal = val;
  }

  toggleDeleteLibraryItemModal(val: boolean) {
    this.showDeleteLibraryItemModal = val;
  }

  /**
   * Opens the Change Log modal for a specified learning object and fetches its change logs
   */
  async openViewAllChangelogsModal(notification: any) {
    this.changelogLearningObject = await this.learningObjectService.getLearningObject(
      notification.attributes.learningObjectAuthorUsername,
      notification.attributes.cuid,
      notification.attributes.version
    );
    if (!this.openChangelogModal) {
      this.loadingChangelogs = true;
      try {
        this.changelogs = await this.changelogService.fetchAllChangelogs({
          userId: notification.attributes.learningObjectAuthorID,
          learningObjectCuid: notification.attributes.cuid,
          minusRevision: true,
        });
      } catch (error) {
        let errorMessage;

        if (error.status === 401) {
          // user isn't logged-in, set client's state to logged-out and reload so that the route guards can redirect to login page
          this.authService.logout();
        } else {
          errorMessage = `We encountered an error while attempting to
          retrieve change logs for this Learning Object. Please try again later.`;
        }
        this.toaster.error('Error!', errorMessage);
      }
      this.loadingChangelogs = false;
      this.openChangelogModal = true;
    }
  }

  /**
   * Closes any open change log modals
   */
  closeChangelogsModal() {
    this.openChangelogModal = false;
    this.changelogs = undefined;
  }

  async changeLibraryItemPage(pageNumber: number) {
    const libraryItemInformation = await this.libraryService.getLibrary(pageNumber, 10);
    this.libraryItems = libraryItemInformation.cartItems;
    this.lastPageNumber = libraryItemInformation.lastPage;
    this.currentPageNumber = pageNumber;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }

}

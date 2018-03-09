import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.services';

@Component({
  selector: 'app-user-edit-information',
  templateUrl: './user-edit-information.component.html',
  styleUrls: ['./user-edit-information.component.css']
})
export class UserEditInformationComponent implements OnInit {
  
  editInfo = {
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
  };

  passwordVerify = '';
  registerFailure;
  registerFailureTimer;
  redirectRoute;
  redirectUrl;

  constructor(private userService: UserService) {}

  ngOnInit() {
    
  }

  submit() {
    this.registerFailure = undefined;
    clearTimeout(this.registerFailureTimer);
    
    let concatInfo = { 
      name: this.editInfo.firstname +  " " + this.editInfo.lastname,
      email: this.editInfo.email, 
      organization: this.editInfo.organization
    }

    this.userService.editUserInfo(concatInfo).then(val => {
      if (this.redirectRoute) {
        window.location.href = window.location.origin + this.redirectRoute;
        // this.router.navigate([this.redirectRoute]);
      } else {
        window.location.href = this.redirectUrl;
      }
    }, error => {
      console.log(error);
    });
  }

  error(text: string = 'An error occured', duration: number = 4000) {
    this.registerFailure = text;

    this.registerFailureTimer = setTimeout(() => {
      this.registerFailure = undefined;
    }, duration);

  }

}

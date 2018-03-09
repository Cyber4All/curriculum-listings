import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { DetailsComponent } from './learning-object-details/details/details.component';
import { CartComponent } from './cart/cart.component';
import { BrowseComponent } from './browse/browse.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { RouterComponent } from './shared/breadcrumb/router.component';
import { AuthGuard } from './auth/services/auth-guard.service';
import { AuthResolve } from './auth/auth.resolver';
import { UserEditInformationComponent } from './user-edit-information/user-edit-information.component'

const detailRoute = {
    path: 'details/:username/:learningObjectName', component: DetailsComponent, data: { breadcrumb: 'Details' }
};
const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    detailRoute,
    { path: 'home', component: HomeComponent, },
    {
        path: 'browse/:query', component: RouterComponent, data: { breadcrumb: 'Browse' },
        children: [{ path: '', component: BrowseComponent }, detailRoute]
    },
    {
        path: 'browse', component: RouterComponent, data: { breadcrumb: 'Browse' },
        children: [{ path: '', component: BrowseComponent }, detailRoute]
    },
    {
        path: 'library', component: RouterComponent, data: { breadcrumb: 'Library' }, canActivate: [AuthGuard],
        children: [{ path: '', component: CartComponent }, detailRoute]
    }, 
    { path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule', data: { hideNavbar: true, hideTopbar: true, hideFooter: true }, resolve: { redirect:  AuthResolve} },
    { path: 'userprofile', component: UserProfileComponent, data: { breadcrumb: 'Profile' }, canActivate: [AuthGuard] },
    { path: 'userpreferences', component: UserPreferencesComponent, data: { breadcrumb: 'Preferences' }, canActivate: [AuthGuard] },
    { path: 'usereditinfo', component: UserProfileComponent, data: { breadcrumb: 'Edit' }, canActivate: [AuthGuard] },
    // Catch All
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

export const RoutingModule: ModuleWithProviders = RouterModule.forRoot(routes);

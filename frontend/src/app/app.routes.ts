import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainMenuComponent } from './components/main.menu/main.menu.component';
import { GameContainerComponent } from './components/game.container/game.container.component';
import { ProfileComponent } from './components/profile/profile.component';


export const routes: Routes = [
   {
        path:'login',
        component: LoginComponent
    },
    {
        path:'menu',
        component: MainMenuComponent
    },
    {
        path: 'game/:type',
        component: GameContainerComponent
    },
    {
        path: 'profile',
        component: ProfileComponent
    }
];

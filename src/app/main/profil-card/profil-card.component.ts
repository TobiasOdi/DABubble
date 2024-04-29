import { Component, OnInit, inject } from '@angular/core';
import { ProfilCardService } from '../../services/profil-card.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, doc, setDoc, limit, onSnapshot, orderBy, query } from '@angular/fire/firestore';
import { getAuth, updateEmail, updateProfile } from '@angular/fire/auth';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-profil-card',
  standalone: true,
  imports: [CommonModule, MatIcon, FormsModule],
  templateUrl: './profil-card.component.html',
  styleUrl: './profil-card.component.scss'
})

export class ProfilCardComponent implements OnInit {
  private db: Firestore = inject(Firestore);

  authSubscription: any;
  auth = getAuth();
  edit: boolean = false;
  userNameandSurname: string = '';
  profilePic: string = '';
  userId: string = '';
  userEmailAddress: string = '';
  newEmail: string;
  newName: string;

  constructor(public serviceProfilCard: ProfilCardService, private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.serviceProfilCard.getTheLoggedInUser();
  }

  toggleEdit(active: boolean) {
    this.serviceProfilCard.checkIfGuestOnline();
    this.edit = active;
  }

  getTheLoggedInUser() {
    this.authSubscription = this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.profilePic = user.photoURL;
        this.userNameandSurname = user.displayName;
        this.userEmailAddress = user.email;
      } else {
        this.profilePic = 'https://firebasestorage.googleapis.com/v0/b/dabubble-2a0d1.appspot.com/o/profileImages%2Fprofile_generic_big.png?alt=media&token=21d6596f-09e9-402b-8191-db3ad0f77b26';
        this.userNameandSurname = 'Max Mustermann';
        this.userEmailAddress = 'maxmustermann@gmail.com'
      }
    });
  }

  async updateUserData() {
    if (this.newName != '') {
      await updateProfile(this.auth.currentUser, {
        displayName: this.newName,
      })
      this.newName = '';
    }
    if (this.newEmail != '') {
      await updateEmail(this.auth.currentUser, this.newEmail)
    }
    this.newEmail = '';
    this.createUserDetailsDoc();
    this.toggleEdit(false);
    this.serviceProfilCard.getTheLoggedInUser();
  }

  async createUserDetailsDoc() {
    await setDoc(doc(this.db, "users", this.auth.currentUser.uid), {
      name: this.auth.currentUser.displayName,
      email: this.auth.currentUser.email,
      imgUrl: this.auth.currentUser.photoURL,
      isOnline: false,
      id: this.auth.currentUser.uid,
    });
  }
}

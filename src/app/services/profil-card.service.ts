import { EventEmitter, Injectable, inject } from '@angular/core';
import { User } from '../../models/user.class';
import { ChatService } from './chat.service';
import { Firestore, collection, doc, setDoc, onSnapshot, query } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})

export class ProfilCardService {
  private db: Firestore = inject(Firestore);

  userRef = collection(this.db, 'users');
  auth = getAuth();
  allUser = [];
  authSubscription: any;
  userNameandSurname: string = '';
  profilePic: string = '';
  userId: string = '';
  userEmailAddress: string = '';
  headerProfilePic: string = '';
  headerUserNameandSurname: string = '';
  currentUserId: string = '';
  otherUserId: string = '';
  guestIsOnline: boolean = false;

  isProfilCardActive: boolean = false;
  isOverlayActive: boolean = false;
  isOverlayDropdownActive: boolean = false;
  isCurrentUserActive: boolean;
  isProfilCardActiveChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private chatService: ChatService) { }

  checkIfGuestOnline() {
    if (this.auth.currentUser.uid == 'X9APNd1z7yVsW7sP3kyVk79DHWo1') {
      this.guestIsOnline = true;
    } else {
      this.guestIsOnline = false;
    }
  }

  /**
   * Toggles the overlay of the profile card.
   * @param active - Boolean indicating if the overlay should be active.
   */
  toggleCardOverlay(active: boolean) {
    this.isOverlayActive = active;
    this.isOverlayDropdownActive = active;
    this.isProfilCardActiveChanged.emit(active); // Emit event when the variable changes
    if (this.isProfilCardActive = true) {
      this.isProfilCardActive = false;
    }
  }

  /**
   * Toggles the visibility of the profile card.
   * @param active - Boolean indicating if the profile card should be active.
   * @param currentUser - Boolean indicating if the current user's profile card is active.
   * @param userId - The ID of the user whose profile card is being toggled.
   */
  toggleProfilCard(active: boolean, currentUser: boolean, userId: string) {
     if (!this.isOverlayActive) {
      this.isOverlayActive = true;
    }
    this.isProfilCardActive = active;
    this.isCurrentUserActive = currentUser;
    if (currentUser == false) {
      this.otherUserId = userId;
      let userDocRef = doc(this.userRef, userId);
      onSnapshot(userDocRef, (element) => {
        let userData = element.data();
        this.userNameandSurname = userData['name'];
        this.userEmailAddress = userData['email'];
        this.profilePic = userData['imgUrl']
      })
    }
  }
 
  toggleProfilCardHeader(active: boolean, currentUser: boolean, userId: string) {
    if (!this.isOverlayDropdownActive) {
     this.isOverlayDropdownActive = true;
   }
   this.isProfilCardActive = active;
   this.isCurrentUserActive = currentUser;
   if (currentUser == false) {
     this.otherUserId = userId;
     let userDocRef = doc(this.userRef, userId);
     onSnapshot(userDocRef, (element) => {
       let userData = element.data();
       this.userNameandSurname = userData['name'];
       this.userEmailAddress = userData['email'];
       this.profilePic = userData['imgUrl']
     })
   }
 }


  /**
  * Updates the header with the provided name.
  * @param name - The name to be displayed in the header.
  * @returns The updated header.
  */
  updateHeader(name: string) {
    return name;
  }

  /**
   * Loads user data from Firestore.
   * @returns Snapshot listener for user data.
   */
  loadUserFromFirestore() {
    return onSnapshot(this.userRef, (list) => {
      // console.log('Hier sind die User:', list);
      this.allUser = [];
      list.forEach(element => {
        // console.log('Hier sind die User:', element.data(), element.id);
        this.allUser.push(new User(element.data()));
      })
    })
  }

  /**
   * Retrieves the logged-in user's information.
   */
  getTheLoggedInUser() {
    this.authSubscription = this.auth.onAuthStateChanged((user) => {
      if(user) {
        if(this.auth.currentUser.uid == 'X9APNd1z7yVsW7sP3kyVk79DHWo1') {
          this.headerProfilePic = 'https://firebasestorage.googleapis.com/v0/b/dabubble-2a0d1.appspot.com/o/profileImages%2Fprofile_generic_big.png?alt=media&token=21d6596f-09e9-402b-8191-db3ad0f77b26g';
          this.profilePic = 'https://firebasestorage.googleapis.com/v0/b/dabubble-2a0d1.appspot.com/o/profileImages%2Fprofile_generic_big.png?alt=media&token=21d6596f-09e9-402b-8191-db3ad0f77b26g';
          this.userNameandSurname = 'Gast';
          this.headerUserNameandSurname = 'Gast';

        } else {
          this.profilePic = user.photoURL;
          this.headerProfilePic = user.photoURL;
          this.userNameandSurname = user.displayName;
          this.headerUserNameandSurname = user.displayName;
        }

        this.userEmailAddress = user.email;
        this.currentUserId = user.uid;
      } else {
        this.profilePic = 'https://firebasestorage.googleapis.com/v0/b/dabubble-2a0d1.appspot.com/o/profileImages%2Fprofile_generic_big.png?alt=media&token=21d6596f-09e9-402b-8191-db3ad0f77b26';
        this.userNameandSurname = 'Max Mustermann';
        this.userEmailAddress = 'maxmustermann@gmail.com'
      }
    });
  }

  /**
  * Writes a direct message between two users.
  * @returns Snapshot listener for direct messages.
  */
  writeDirectMessage() {
    const q = query(collection(this.db, `users/${this.auth.currentUser.uid}/allDirectMessages`));
    return onSnapshot(q, (list) => {
      list.forEach(element => {
          if (element.id === this.otherUserId) {
          this.chatService.setSelectedUserId(this.otherUserId);
          this.toggleCardOverlay(false);
        } else {
          // Create new DM Chat
          this.addDirectMessage();
          this.toggleCardOverlay(false);
          this.chatService.setSelectedUserId(this.otherUserId);
        }  
      });
    });
  }

  /**
   * Adds a new direct message between two users.
   * @returns Promise that resolves when the direct message is added.
   */
  async addDirectMessage(): Promise<void> {
    const dmSenderRef = doc(collection(this.db, `users/${this.auth.currentUser}/allDirectMessages`), this.otherUserId);
    const dmReceiverRef = doc(collection(this.db, `users/${this.otherUserId}/allDirectMessages`), this.currentUserId);
    let data = {}
    await setDoc(dmSenderRef, data);
    await setDoc(dmReceiverRef, data);
    this.chatService.setSelectedUserId(this.otherUserId);
  }
}

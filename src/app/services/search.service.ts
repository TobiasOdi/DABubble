import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, query } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})

export class SearchService {
  private db: Firestore = inject(Firestore);

  userRef = collection(this.db, 'users');
  channelRef = collection(this.db, 'channels');
  threadsRef = collection(this.db, 'channels');
  auth = getAuth();

  searchUserResult = [];
  searchChannelsResult = [];
  threads = [];

  constructor() { }

  /**
 * Searches for users based on the provided input.
 * @param {string} input - The input to search for in user names.
 * @returns {Observable} - Returns an observable that emits user search results.
 */
  searchUsers(input: string) {
    this.searchUserResult = [];
    let q = query(this.userRef);
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        let compare = element.data()['name'].toLowerCase();
        let result = element.data();
        if (compare.includes(input.toLowerCase())) {
          this.searchUserResult.push(result);
        }
      })
    })
  }

  /**
 * Searches for users whose names contain a specific substring after an '@' symbol.
 * @param {string} input - The input after the '@' symbol to search for in user names.
 * @returns {Observable} - Returns an observable that emits user search results.
 */
  seachUsersAt(input: string) {
    this.searchUserResult = [];
    let q = query(this.userRef);
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        let compare = element.data()['name'].toLowerCase();
        let result = element.data();
        if (compare.includes(input.slice(1).toLowerCase())) {
          this.searchUserResult.push(result);
        }
      })
    })
  }

  /**
   * Searches for channels based on the provided input.
   * @param {string} input - The input to search for in channel names.
   * @returns {Observable} - Returns an observable that emits channel search results.
   */
  searchChannels(input: string) {
    this.searchChannelsResult = [];
    let q = query(this.channelRef);
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        let compare = element.data()['name'].toLowerCase();
        let result = element.data();
        let docId = element.id;
        let members = element.data()['members'];
        if (members.includes(this.auth.currentUser.uid)) {
          if (compare.includes(input.toLowerCase())) {
            this.searchChannelsResult.push({ id: docId, ...result });
          }
        }
      })
    })
  }

  /**
   * Searches for channels whose names contain a specific substring after an '@' symbol.
   * @param {string} input - The input after the '@' symbol to search for in channel names.
   * @returns {Observable} - Returns an observable that emits channel search results.
   */
  searchChannelsAt(input: string) {
    this.searchChannelsResult = [];
    let q = query(this.channelRef);
    return onSnapshot(q, (list) => {
      list.forEach(element => {
        let compare = element.data()['name'].toLowerCase();
        let result = element.data();
        let docId = element.id;
        let members = element.data()['members'];
        if (members.includes(this.auth.currentUser.uid)) {
          if (compare.includes(input.slice(1).toLowerCase())) {
            this.searchChannelsResult.push({ id: docId, ...result });
          }
        }
      })
    })
  }

  /**
    * Searches for threads based on the provided input.
    * @param {string} input - The input to search for in thread messages.
    * @returns {Observable} - Returns an observable that emits thread search results.
    */
  searchThreads(input: string) {
    this.threads = [];
    let q = query(this.channelRef);
    return onSnapshot(q, (list) => {
      list.forEach((element) => {
        let members = element.data()['members'];
        let docId = element.id;
        let channelName = element.data()['name'];
        if (members.includes(this.auth.currentUser.uid)) {
          this.findThreads(input, docId, channelName)
        }
      });
    });
  }

  /**
  * Finds threads within a specific channel based on the provided input.
  * @param {string} input - The input to search for in thread messages.
  * @param {string} docId - The ID of the channel to search for threads within.
  * @param {string} channelName - The name of the channel.
  */
  findThreads(input: string, docId: string, channelName: string) {
    let channelDocRef = doc(this.channelRef, docId);
    let threadsRef = collection(channelDocRef, 'threads');
    onSnapshot(threadsRef, (threadSnapshot) => {
      threadSnapshot.forEach((threadDoc) => {
        let compare = threadDoc.data()['message'].toLowerCase();
        if (compare.includes(input.toLowerCase())) {
          this.threads.push({ id: docId, channelName: channelName, ...threadDoc.data() });
        }
      });
    });
  }

  /**
 * Checks if there are no search results found.
 * @returns {boolean} - Returns true if no search results are found, otherwise false.
 */
  noResultFound() {
    if (this.searchChannelsResult.length === 0 && this.searchUserResult.length === 0 && this.threads.length === 0) {
      return true;
    } else {
      return false;
    }
  }
}

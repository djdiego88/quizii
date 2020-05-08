import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor(
    private storage: AngularFireStorage,
    private httpClient: HttpClient
  ) {
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value(callback, type, quality) {
          const dataURL = this.toDataURL(type, quality).split(',')[1];
          setTimeout(() => {
            const binStr = atob( dataURL );
            const len = binStr.length;
            const arr = new Uint8Array(len);
            for (let i = 0; i < len; i++ ) {
              arr[i] = binStr.charCodeAt(i);
            }
            callback( new Blob( [arr], {type: type || 'image/jpeg'} ) );
          });
        }
      });
    }
   }

   randomId(pos: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomId = '';
    for (let i = 0; i < pos; i++) {
      randomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomId;
  }

  uploadImages(elem: any, folder: string, randomId: string, file: any, extension: string = 'jpg') {
    return new Promise ((resolve) => {
      const filePath = `${folder}/${randomId}-${elem.size}.${extension}`;
      const fileRef = this.storage.ref(filePath);

      if (elem.size === 'full') {
        const task = this.storage.upload(filePath, file);
        task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              resolve(url);
            });
          })
        ).subscribe();
      } else {
        this.resizeImage(file, elem.width, elem.height, file.type).subscribe(newFile => {
          this.storage.upload(filePath, newFile).snapshotChanges().pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe(url => {
                resolve(url);
              });
            })
          ).subscribe();
        });
      }
    });
  }

  async deleteImage(url: string) {
    return await this.storage.storage.refFromURL(url).delete();
  }

  resizeImage(file: File, width: number = 700, height: number = 700, type: string = 'image/jpeg', quality: number = 1): Observable<any> {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Observable((observer) => {
      reader.onload = ev => {
        const imageObj = new Image();
        imageObj.src = (ev.target as any).result; // DataURI Base64
        (imageObj.onload = () => {
          const canvas = document.createElement('canvas'); // Use Angular's Renderer2 method
          const ctx =  canvas.getContext('2d') as CanvasRenderingContext2D;
          let xStart   = 0;
          let yStart   = 0;
          let aspectRatio;
          let newWidth;
          let newHeight;

          canvas.width  = width;
          canvas.height = height;

          aspectRatio = imageObj.height / imageObj.width;

          if (imageObj.height < imageObj.width) {
            // horizontal
            aspectRatio = imageObj.width / imageObj.height;
            newHeight   = height,
            newWidth    = aspectRatio * height;
            xStart      = -(newWidth - width) / 2;
          } else {
            // vertical
            newWidth  = width,
            newHeight = aspectRatio * width;
            yStart    = -(newHeight - height) / 2;
          }

          ctx.drawImage(imageObj, xStart, yStart, newWidth, newHeight);
          //observer.next(canvas.toDataURL(type, quality));
          ctx.canvas.toBlob(
            blob => {
              observer.next(
                new File([blob], file.name, {
                  type,
                  lastModified: Date.now(),
                }),
              );
            },
            type,
            quality,
          );
        }),
          (reader.onerror = error => observer.error(error));
      };
    });
  }

  @Cacheable({
    maxAge: 60000000
  })
  public getCountryList() {
    const browserLanguage = navigator.language.split('-')[0];
    const countryService = `https://cdn.jsdelivr.net/gh/umpirsky/country-list/data/${browserLanguage}/country.json`;
    const countryObject = this.httpClient.get(countryService);
    return countryObject;
  }

  public getAppLanguages() {
    return ['en', 'es', 'fr', 'pt', 'de', 'it'];
  }

  public async downloadFileFromURL(url: string): Promise<Blob> {
    const file =  await this.httpClient.get<Blob>(
      url,
      {responseType: 'blob' as 'json'}).toPromise();
    return file;
  }

  public getAvatarSizes() {
    return [
      {size: 'mini', width: 100, height: 100},
      {size: 'thumbnail', width: 150, height: 150},
      {size: 'medium', width: 300, height: 300},
      {size: 'full', width: null, height: null},
    ];
  }

  public getNamesFromDisplayName(displayName: string): Promise<any> {
    const names = displayName.split(' ');
    const name: any = {};

    if (names.length === 1) {
      name.firstName = names[0];
      name.lastName = '';
    } else if (names.length === 2) {
      name.firstName = names[0];
      name.lastName = names[1];
    } else if (names.length === 3) {
      name.firstName = `${names[0]} ${names[1]}`;
      name.lastName = names[2];
    } else if (names.length === 4) {
      name.firstName = `${names[0]} ${names[1]}`;
      name.lastName = `${names[2]} ${names[3]}`;
    } else if (names.length === 5) {
      name.firstName = `${names[0]} ${names[1]}`;
      name.lastName = `${names[2]} ${names[3]} ${names[4]}`;
    } else if (names.length === 6) {
      name.firstName = `${names[0]} ${names[1]} ${names[2]}`;
      name.lastName = `${names[3]} ${names[4]} ${names[5]}`;
    }
    return name;
  }
}

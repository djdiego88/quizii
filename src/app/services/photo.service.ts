import { Injectable } from '@angular/core';
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  constructor() { }

  public async getPhotoBlob(webPath: any) {
    // tslint:disable-next-line: no-non-null-assertion
    const response = await fetch(webPath!);
    return await response.blob();
  }

  public async getPhotoPath() {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      saveToGallery: true,
      quality: 100 // highest quality (0 to 100)
    });
    return capturedPhoto.webPath;
  }
}

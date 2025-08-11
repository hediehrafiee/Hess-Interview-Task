import { FormControl } from '@angular/forms';
import { NzUploadFile } from 'ng-zorro-antd/upload';

export class ImageHandler {
  public fileList: NzUploadFile[] = [];

  constructor(private formControl: FormControl<string | null>) {}

  /** Handles the before-upload action for an image. */
  beforeUpload = (file: NzUploadFile): boolean => {
    const url = URL.createObjectURL(file as unknown as File);
    this.fileList = [
      {
        uid: Date.now().toString(),
        name: file.name,
        status: 'done',
        url,
        thumbUrl: url,
      },
    ];
    this.formControl.setValue(url);
    return false; // Prevent Ant Design's default upload behavior
  };

  /** Handles the remove action for an image. */
  remove = (): boolean => {
    this.fileList = [];
    this.formControl.setValue(null);
    return true;
  };

  /** Creates an initial file list from a URL for edit mode. */
  createInitialFile(url: string | undefined, name: string): void {
    if (url) {
      this.fileList = [
        {
          uid: `existing-${name}`,
          name,
          status: 'done',
          url,
          thumbUrl: url,
        },
      ];
    }
  }
}

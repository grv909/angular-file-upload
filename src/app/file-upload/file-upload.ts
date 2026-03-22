import { Component } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UploadEvent, UploadFile } from '../core/upload-file-service/upload-file';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  imports: [AsyncPipe,JsonPipe],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload {
  uploadState$!: Observable<UploadEvent>;
  private cancel$ = new Subject<void>();

  constructor(private uploadService: UploadFile) {}

  attachFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Reset cancel subject
    this.cancel$ = new Subject<void>();

    this.uploadState$ = this.uploadService
      .uploadFile(file, { id: '13' })
      .pipe(takeUntil(this.cancel$));
  }

  cancelUpload() {
    this.cancel$.next();
    this.cancel$.complete();
  }
}

import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { UploadEvent, UploadFile } from '../core/upload-file-service/upload-file';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

@Component({
  selector: 'app-file-upload',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload {
  uploadState$!: Observable<UploadEvent>;
  private cancel$ = new Subject<void>();

  uploadedFiles: UploadedFile[] = [];

  constructor(
    private uploadService: UploadFile,
    private cdr: ChangeDetectorRef,
  ) {}

  attachFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    this.cancel$ = new Subject<void>();

    this.uploadState$ = this.uploadService
      .uploadFile(file, { id: '13' })
      .pipe(takeUntil(this.cancel$));

    // Subscribe here to catch success once
    this.uploadState$.subscribe((event) => {
      if (event.type === 'success') {
        // Add to uploadedFiles immediately on success
        this.uploadedFiles = [
          ...this.uploadedFiles,
          {
            name: file.name,
            size: file.size,
            type: file.type || 'unknown',
          },
        ];
        this.cdr.markForCheck();
      }
    });
  }

  cancelUpload() {
    this.cancel$.next();
    this.cancel$.complete();
  }

  deleteUploadedFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }
}

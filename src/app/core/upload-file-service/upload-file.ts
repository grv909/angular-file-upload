import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

export type UploadEvent =
  | { type: 'progress'; value: number }
  | { type: 'success'; body: any }
  | { type: 'error'; message: string };

@Injectable({
  providedIn: 'root',
})
export class UploadFile {
  constructor(private http: HttpClient) {}
  uploadFile(file: File, metadata: any): Observable<UploadEvent> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', metadata.id);

    const req = new HttpRequest('POST', 'http://localhost:3000/upload', formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req).pipe(
      map((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? 0;
          const progress = total ? Math.round((100 * event.loaded) / total) : 0;

          return { type: 'progress', value: progress } as const;
        }

        if (event.type === HttpEventType.Response) {
          return { type: 'success', body: event.body } as const;
        }

        return { type: 'progress', value: 0 } as const;
      }),
      catchError((err) =>
        of({
          type: 'error',
          message: err?.message || 'Upload failed',
        } as const),
      ),
    );
  }
}

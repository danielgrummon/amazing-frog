import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
    handleError(error: HttpErrorResponse): Observable<never> {
        let userMessage = 'An error occurred. Please try again.';

        if (error.status === 0) {
            userMessage = 'Network error. Please check your connection.';
        } else if (error.status >= 500) {
            userMessage = 'Server error. Please try again later.';
        } else if (error.status === 404) {
            userMessage = 'Data not found.';
        }

        console.error('API Error:', error);
        return throwError(() => new Error(userMessage));
    }
}

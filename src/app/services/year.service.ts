import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class YearService {
  getYearRangeFromCreationDate(creationDate): number[] {
    const creationYear = new Date(creationDate).getFullYear();
    const currentYear = new Date().getFullYear();

    const yearRange = [];
    for (let year = creationYear; year <= currentYear; year++) {
      yearRange.push(year);
    }

    return yearRange;
  }
}

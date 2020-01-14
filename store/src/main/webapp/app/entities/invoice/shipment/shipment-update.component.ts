import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';

import { IShipment, Shipment } from 'app/shared/model/invoice/shipment.model';
import { ShipmentService } from './shipment.service';
import { IInvoice } from 'app/shared/model/invoice/invoice.model';
import { InvoiceService } from 'app/entities/invoice/invoice/invoice.service';

@Component({
  selector: 'jhi-shipment-update',
  templateUrl: './shipment-update.component.html'
})
export class ShipmentUpdateComponent implements OnInit {
  isSaving = false;

  invoices: IInvoice[] = [];

  editForm = this.fb.group({
    id: [],
    trackingCode: [],
    date: [null, [Validators.required]],
    details: [],
    invoice: [null, Validators.required]
  });

  constructor(
    protected shipmentService: ShipmentService,
    protected invoiceService: InvoiceService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ shipment }) => {
      this.updateForm(shipment);

      this.invoiceService
        .query()
        .pipe(
          map((res: HttpResponse<IInvoice[]>) => {
            return res.body ? res.body : [];
          })
        )
        .subscribe((resBody: IInvoice[]) => (this.invoices = resBody));
    });
  }

  updateForm(shipment: IShipment): void {
    this.editForm.patchValue({
      id: shipment.id,
      trackingCode: shipment.trackingCode,
      date: shipment.date != null ? shipment.date.format(DATE_TIME_FORMAT) : null,
      details: shipment.details,
      invoice: shipment.invoice
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const shipment = this.createFromForm();
    if (shipment.id !== undefined) {
      this.subscribeToSaveResponse(this.shipmentService.update(shipment));
    } else {
      this.subscribeToSaveResponse(this.shipmentService.create(shipment));
    }
  }

  private createFromForm(): IShipment {
    return {
      ...new Shipment(),
      id: this.editForm.get(['id'])!.value,
      trackingCode: this.editForm.get(['trackingCode'])!.value,
      date: this.editForm.get(['date'])!.value != null ? moment(this.editForm.get(['date'])!.value, DATE_TIME_FORMAT) : undefined,
      details: this.editForm.get(['details'])!.value,
      invoice: this.editForm.get(['invoice'])!.value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IShipment>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  trackById(index: number, item: IInvoice): any {
    return item.id;
  }
}

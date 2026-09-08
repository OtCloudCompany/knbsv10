import {
  AsyncPipe,
  DatePipe,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownViewerComponent } from 'src/app/shared/markdown-viewer/markdown-viewer.component';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';

/**
 * The KNBS footer: a developer bar advertising the machine readable entry points of the repository
 * (REST API, OAI-PMH, OpenSearch and the COAR Notify LDN inbox), a four column institutional
 * footer, and the standard DSpace bottom bar.
 *
 * All endpoints are derived from the configured REST base url, so they stay correct across
 * environments without any further configuration.
 */
@Component({
  selector: 'ds-themed-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  imports: [
    AsyncPipe,
    DatePipe,
    MarkdownViewerComponent,
    RouterLink,
    TranslateModule,
  ],
})
export class FooterComponent extends BaseComponent implements OnInit {

  /**
   * The REST base url, e.g. https://repository.knbs.or.ke/server
   */
  restBaseUrl: string;

  restApiUrl: string;
  oaiPmhUrl: string;
  openaireOaiUrl: string;
  openSearchUrl: string;
  ldnInboxUrl: string;

  ngOnInit(): void {
    super.ngOnInit();
    this.restBaseUrl = (this.appConfig.rest.baseUrl ?? '').replace(/\/$/, '');
    this.restApiUrl = `${this.restBaseUrl}/api`;
    this.oaiPmhUrl = `${this.restBaseUrl}/oai/request?verb=Identify`;
    this.openaireOaiUrl = `${this.restBaseUrl}/oai/openaire?verb=Identify`;
    this.openSearchUrl = `${this.restBaseUrl}/opensearch/search?query=*`;
    this.ldnInboxUrl = `${this.restBaseUrl}/ldn/inbox`;
  }

}

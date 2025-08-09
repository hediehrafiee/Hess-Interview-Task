import {ChangeDetectionStrategy, Component, effect, input, output, signal} from '@angular/core';
import {SharedModule} from "../../shared.module";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzFormModule} from 'ng-zorro-antd/form';

@Component({
  selector: 'ha-panel',
  imports: [SharedModule, NzButtonModule, NzFormModule],
  templateUrl: './ha-panel.component.html',
  styleUrl: './ha-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HaPanelComponent {

  // Inputs
  panelHeading = input('');
  collapsible = input(false);
  isInitiallyCollapsed = input(false);
  editButton = input(false);
  addButton = input(false);

  // Outputs
  readonly editButtonClick = output<void>();
  readonly addButtonClick = output<void>();

  initialized = signal(false);
  isCollapsed = signal(false);

  constructor(

  ) {
    effect(() => {
      if (!this.initialized()) {
        this.isCollapsed.set(this.isInitiallyCollapsed());
        this.initialized.set(true);
      }
    });
  }
}

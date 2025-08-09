import { Component } from "@angular/core";
import { SharedModule } from "../../common/shared.module";

@Component({
  selector: "private-pages",
  imports: [
    SharedModule
  ],
  templateUrl: "./private-pages.component.html",
  styleUrl: "./private-pages.component.scss",
  standalone: true,
})
export class PrivatePagesComponent {
}

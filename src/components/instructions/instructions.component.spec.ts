import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstructionsComponent } from './instructions.component';
import { InfoPanelComponent } from '../info-panel/info-panel.component';
import { By } from '@angular/platform-browser';

describe('InstructionsComponent', () => {
  let component: InstructionsComponent;
  let fixture: ComponentFixture<InstructionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructionsComponent, InfoPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstructionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display desktop instructions when isDesktop is true', () => {
    component.isDesktop = true;
    fixture.detectChanges();
    const listElements = fixture.debugElement.queryAll(By.css('li'));
    expect(listElements.length).toBe(6);
    expect(listElements[0].nativeElement.textContent).toContain('Left/Right:');
  });

  it('should display mobile instructions when isDesktop is false', () => {
    component.isDesktop = false;
    fixture.detectChanges();
    const listElements = fixture.debugElement.queryAll(By.css('li'));
    expect(listElements.length).toBe(6);
    expect(listElements[0].nativeElement.textContent).toContain('Swipe Left/Right:');
  });
});
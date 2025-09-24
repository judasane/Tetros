import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { CellComponent } from './cell.component';
import { PIECE_COLORS } from '../../utils/constants';

describe('CellComponent', () => {
  let fixture: ComponentFixture<CellComponent>;
  let component: CellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CellComponent);
    component = fixture.componentInstance;
  });

  it('should return the correct class for an empty cell (value 0)', () => {
    fixture.componentRef.setInput('value', 0);
    fixture.detectChanges();
    expect(component.cellClass()).toBe('bg-slate-800');
  });

  it('should return the correct class for a locked piece (value > 0)', () => {
    const pieceColorIndex = 1; // Corresponds to 'cyan'
    fixture.componentRef.setInput('value', pieceColorIndex);
    fixture.detectChanges();
    const expectedColor = PIECE_COLORS[pieceColorIndex];
    expect(component.cellClass()).toBe(`bg-${expectedColor} shadow-inner shadow-white/20`);
  });

  it('should return the correct class for a ghost piece (value -1)', () => {
    fixture.componentRef.setInput('value', -1);
    fixture.detectChanges();
    expect(component.cellClass()).toBe('bg-slate-500/30 border border-slate-400/50');
  });

  it('should return the correct class for an aimer target (value -2)', () => {
    fixture.componentRef.setInput('value', -2);
    fixture.detectChanges();
    expect(component.cellClass()).toBe('bg-yellow-500/70 animate-pulse border-2 border-yellow-300');
  });

  it('should return the correct class for a line clearing animation (value -3)', () => {
    fixture.componentRef.setInput('value', -3);
    fixture.detectChanges();
    expect(component.cellClass()).toBe('animate-line-clear');
  });
});
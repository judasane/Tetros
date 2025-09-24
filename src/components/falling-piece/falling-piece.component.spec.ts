import { TestBed, ComponentFixture } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { FallingPieceComponent } from './falling-piece.component';
import { Piece } from '../../utils/piece.interface';

const MOCK_PIECE: Piece = {
    x: 3,
    y: 5,
    shape: [[1, 1], [1, 1]],
};

describe('FallingPieceComponent', () => {
  let fixture: ComponentFixture<FallingPieceComponent>;
  let component: FallingPieceComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FallingPieceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FallingPieceComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('piece', MOCK_PIECE);
    fixture.componentRef.setInput('cellSize', 20); // Use an easy-to-calculate number
  });

  describe('position signal', () => {
    it('should calculate correct left and top in pixels', () => {
      fixture.componentRef.setInput('animationMode', 'step'); // No yOffset
      fixture.detectChanges();

      const pos = component.position();
      expect(pos.left).toBe(MOCK_PIECE.x * 20); // 3 * 20 = 60
      expect(pos.top).toBe(MOCK_PIECE.y * 20);  // 5 * 20 = 100
    });

    it('should apply yOffset to top when in "smooth" mode and not a ghost', () => {
      fixture.componentRef.setInput('animationMode', 'smooth');
      fixture.componentRef.setInput('isGhost', false);
      fixture.componentRef.setInput('dropProgress', 0.5);
      fixture.detectChanges();

      const pos = component.position();
      expect(pos.left).toBe(60);
      // top = (y + yOffset) * cellSize = (5 + 0.5) * 20 = 110
      expect(pos.top).toBe(110);
    });

    it('should NOT apply yOffset when it is a ghost piece, even in "smooth" mode', () => {
        fixture.componentRef.setInput('animationMode', 'smooth');
        fixture.componentRef.setInput('isGhost', true);
        fixture.componentRef.setInput('dropProgress', 0.5);
        fixture.detectChanges();

        const pos = component.position();
        expect(pos.top).toBe(100); // yOffset is ignored
      });
  });

  describe('transitionStyle signal', () => {
    it('should return "left..." for "smooth" mode when not a ghost', () => {
        fixture.componentRef.setInput('animationMode', 'smooth');
        fixture.componentRef.setInput('isGhost', false);
        fixture.detectChanges();

        expect(component.transitionStyle()).toContain('left');
        expect(component.transitionStyle()).not.toContain('all');
    });

    it('should return "all..." for "step" mode', () => {
        fixture.componentRef.setInput('animationMode', 'step');
        fixture.componentRef.setInput('isGhost', false);
        fixture.detectChanges();

        expect(component.transitionStyle()).toContain('all');
    });

    it('should return "all..." for a ghost piece, regardless of mode', () => {
        fixture.componentRef.setInput('animationMode', 'smooth');
        fixture.componentRef.setInput('isGhost', true);
        fixture.detectChanges();
        expect(component.transitionStyle()).toContain('all');

        fixture.componentRef.setInput('animationMode', 'step');
        fixture.detectChanges();
        expect(component.transitionStyle()).toContain('all');
    });
  });
});
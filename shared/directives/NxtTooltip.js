import { computePosition, offset, flip, shift, arrow } from '@floating-ui/dom';
import { intersection } from 'ramda';

const PLACEMENT_OPTIONS = [
  'top',
  'top-start',
  'top-end',
  'right',
  'right-start',
  'right-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
];

export const NxtTooltip = {
  mounted(el, { value, modifiers }) {
    el.create = () => {
      if(!el.$container) {
        const $arrow = document.createElement('div');
        $arrow.className = 'nxt-tooltip__arrow';

        const $text = document.createElement('p');
        $text.textContent = value;

        const $container = document.createElement('div');
        $container.className = 'nxt-tooltip';
        $container.setAttribute('role', 'tooltip');
        $container.appendChild($arrow);
        $container.appendChild($text);

        el.$arrow = $arrow;
        el.$container = $container;
      }

      const _modifiers = Object.keys(modifiers);
      const placement = intersection(PLACEMENT_OPTIONS, _modifiers)[0] ?? 'right';

      computePosition(el, el.$container, {
        placement,
        strategy: 'fixed',
        middleware: [
          offset(6),
          flip(),
          shift(),
          arrow({ element: el.$arrow }),
        ],
      }).then(({ x, y, placement, middlewareData }) => {
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[placement.split('-')[0]];

        Object.assign(el.$container.style, {
          left: `${ x }px`,
          top: `${ y }px`,
        });

        {
          const { x, y } = middlewareData.arrow;

          Object.assign(el.$arrow.style, {
            left: x != null ? `${ x }px` : '',
            top: y != null ? `${ y }px` : '',
            [staticSide]: '-4px',
          });
        }
      });

      document.body.appendChild(el.$container);
    };

    el.remove = () => {
      document.body.removeChild(el.$container);
    };

    el.addEventListener('mouseenter', el.create);
    el.addEventListener('mouseleave', el.remove);
  },
  unmounted(el) {
    el.removeEventListener('mouseenter', el.create);
    el.removeEventListener('mouseleave', el.destroy);
    el.$arrow = undefined;
    el.$container = undefined;
  },
};

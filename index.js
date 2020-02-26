import React, { useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import PropTypes from 'prop-types';
import Svg, {
  Circle, G, LinearGradient, Path, Defs, Stop,
} from 'react-native-svg';

const { PI, cos, sin, atan2 } = Math;

const calculateAngle = (pos, radius) => {
  const startAngle = ((2 * PI) - (PI * -0.5));
  const endAngle = (PI + (PI * pos));

  const x1 = -radius * cos(startAngle);
  const y1 = -radius * sin(startAngle);

  const x2 = -radius * cos(endAngle);
  const y2 = -radius * sin(endAngle);

  return { x1, y1, x2, y2 };
};

const calculateRealPos = (x, y, radius, strokeWidth) => ({
  endX: x + radius + strokeWidth / 2,
  endY: y + radius + strokeWidth / 2,
});

const calculateMovement = (x, y, radius, strokeWidth) => {
  const cx = ((x + strokeWidth) / radius) - PI / 2;
  const cy = -(((y + strokeWidth) / radius) - PI / 2);

  let pos = -atan2(cy, cx) / PI;
  if (pos < -0.5) {
    pos += 2;
  }

  return pos;
};

const percentToPos = (percent) => (2 / 100 * percent) - 0.5;
const posToPercent = (pos) => 100 * (pos + 0.5) / 2;

const selectGradient = (gradients, pos) => {
  const current = posToPercent(pos);
  let selected = 0;

  for (const [key] of Object.entries(gradients)) {
    if (key > selected && key < current) {
      selected = key;
    }
  }

  return gradients[selected];
};

const CircularPicker = ({
  size,
  strokeWidth,
  defaultPos,
  steps,
  gradients,
  backgroundColor,
  stepColor,
  borderColor,
  renderContent,
  onChange,
}) => {
  const [pos, setPos] = useState(percentToPos(defaultPos));
  const circle = useRef(null);

  const padding = 8;
  const radius = (size - strokeWidth) / 2 - padding;
  const center = (radius + strokeWidth / 2);

  const gradient = selectGradient(gradients, pos);

  if (steps) {
    steps = steps.map((p) => {
      const pos = percentToPos(p);
      const { x2, y2 } = calculateAngle(pos, radius);
      const { endX: x, endY: y } = calculateRealPos(x2, y2, radius, strokeWidth);
      return { x, y, p };
    });
  }

  const { x1, y1, x2, y2 } = calculateAngle(pos, radius);
  const { endX, endY } = calculateRealPos(x2, y2, radius, strokeWidth);

  const goToPercent = (p) => {
    const newPos = percentToPos(p);
    setPos(newPos);
    onChange(posToPercent(newPos));
  }

  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderMove: (_, { moveX, moveY }) => {
      circle.current.measure((x, y, width, height, px, py) => {
        const newPos = calculateMovement(moveX - px, moveY - py, radius, strokeWidth);
        /**
         * @TODO
         */
        if ((newPos < -0.3 && pos > 1.3)
          || (newPos > 1.3 && pos < -0.3)) {
          return;
        }
        setPos(newPos);
        onChange(posToPercent(newPos));
      });
    }
  });

  const d = `
    M ${x2.toFixed(3)} ${y2.toFixed(3)}
    A ${radius} ${radius}
    ${(pos < 0.5) ? '1' : '0'} ${(pos > 0.5) ? '1' : '0'} 0
    ${x1.toFixed(3)} ${y1.toFixed(3)}
  `;

  return (
    <Svg height={size} width={size} ref={circle}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="100%" y2="0">
          <Stop offset="0" stopColor={gradient[0]} />
          <Stop offset="1" stopColor={gradient[1]} />
        </LinearGradient>
      </Defs>
      <G transform={{ translate: `${strokeWidth / 2 + radius + padding}, ${strokeWidth / 2 + radius + padding}` }}>
        <Circle
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke={backgroundColor}
        />
        <Path
          d={d}
          strokeWidth={strokeWidth}
          stroke={`url(#grad)`}
          fill="none"
        />
      </G>
      <G transform={{ translate: `${center + padding}, ${strokeWidth / 2 + padding}` }}>
        <Circle r={(strokeWidth) / 2} fill={backgroundColor} />
      </G>
      {steps && steps.map((step) => (
        <G transform={{ translate: `${step.x + padding}, ${step.y + padding}` }}>
          <Circle
            r={(strokeWidth / 2.5) / 2}
            fill={stepColor}
            strokeWidth="12"
            onPress={() => goToPercent(step.p)}
          />
        </G>
      ))}
      <G transform={{ translate: `${endX + padding}, ${endY + padding}` }} {...pan.panHandlers}>
        <Circle
          r={(strokeWidth) / 2 + (padding / 2)}
          fill={gradient[1]}
          stroke={borderColor}
          strokeWidth={padding / 1.5}
        />
      </G>
      {renderContent && (
        <View style={{ height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View>{renderContent()}</View>
        </View>
      )}
    </Svg>
  );
}

CircularPicker.propTypes = {
  size: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number,
  defaultPos: PropTypes.number,
  steps: PropTypes.arrayOf(PropTypes.number),
  gradients: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.string)
  ),
  backgroundColor: PropTypes.string,
  stepColor: PropTypes.string,
  borderColor: PropTypes.string,
  onChange: PropTypes.func,
  renderContent: PropTypes.func,
};

CircularPicker.defaultProps = {
  strokeWidth: 45,
  defaultPos: 0,
  steps: [],
  gradients: {
    0: ['rgb(255, 204, 0)', 'rgb(255, 214, 10)'],
  },
  backgroundColor: 'rgb(231, 231, 231)',
  stepColor: 'rgba(0, 0, 0, 0.2)',
  borderColor: 'rgb(255, 255, 255)',
  onChange: () => undefined,
  renderContent: undefined,
};

export default CircularPicker;
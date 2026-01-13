/**
 * Ekthaa Chat Background Pattern
 * A subtle doodle pattern with business/commerce icons
 * Similar to WhatsApp's chat background style
 */

import React from 'react';
import Svg, { Defs, Pattern, G, Rect, Text, Line, Ellipse } from 'react-native-svg';

interface ChatBackgroundProps {
  width?: number | string;
  height?: number | string;
  color?: string;
  opacity?: number;
}

export default function ChatBackground({ 
  width = '100%', 
  height = '100%', 
  color = '#5a9a8e',
  opacity = 1
}: ChatBackgroundProps) {
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <Pattern id="ekthaaPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          {/* Rupee Symbol */}
          <Text x="5" y="15" fontFamily="Arial" fontSize="14" fontWeight="bold" fill={color} opacity={0.2}>₹</Text>
          
          {/* Receipt/Invoice */}
          <G transform="translate(28, 5)" opacity={0.15} stroke={color} fill="none" strokeWidth="1.2">
            <Rect x="0" y="0" width="10" height="14" rx="1"/>
            <Line x1="2" y1="4" x2="8" y2="4"/>
            <Line x1="2" y1="7" x2="8" y2="7"/>
            <Line x1="2" y1="10" x2="6" y2="10"/>
          </G>
          
          {/* Wallet */}
          <G transform="translate(5, 28)" opacity={0.15} stroke={color} fill="none" strokeWidth="1.2">
            <Rect x="0" y="0" width="14" height="10" rx="2"/>
            <Rect x="10" y="3" width="3" height="4" rx="0.5"/>
            <Line x1="0" y1="3" x2="14" y2="3"/>
          </G>
          
          {/* Coins */}
          <G transform="translate(30, 30)" opacity={0.15} stroke={color} fill="none" strokeWidth="1.2">
            <Ellipse cx="6" cy="12" rx="6" ry="2.5"/>
            <Ellipse cx="6" cy="9" rx="6" ry="2.5"/>
            <Ellipse cx="6" cy="6" rx="6" ry="2.5"/>
          </G>
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#ekthaaPattern)" opacity={opacity}/>
    </Svg>
  );
}

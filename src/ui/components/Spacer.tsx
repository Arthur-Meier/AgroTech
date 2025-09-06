/**
 * Spacer component — vertical spacing helper
 * -----------------------------------------------------------------------------
 * PURPOSE
 *  - Provide a tiny, semantic way to add vertical space between UI elements.
 *  - Keeps layout intentions explicit without sprinkling magic numbers inline.
 *
 * USAGE
 *  - <Spacer h={16} /> inserts a 16px-tall gap.
 *  - If `h` is omitted, defaults to 8.
 *
 * NOTES
 *  - This is a presentational component; it should not capture touches or
 *    convey meaning. Use with moderation and consider a design system scale.
 *  - For horizontal space, create a sibling `HSpacer` that sets `width`.
 *
 * Last reviewed: 2025-09-04
 */

import React from 'react';
import { View } from 'react-native';

// Stateless functional component. Accepts an optional `h` (height) prop.
export default function Spacer({ h = 8 }: { h?: number }) {
  // Render a simple View with the given height. No other styles applied.
  return <View style={{ height: h }} />;
}

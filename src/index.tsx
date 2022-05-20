import { Children, useMemo, useState } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { I18nManager, StyleSheet, View } from 'react-native';
import { Defs, LinearGradient, Mask, Path, Rect, Stop, Svg } from 'react-native-svg';
import { colord } from 'colord';
import type { Corner, CornerRadius, CornerRadiusShadow, RadialGradientPropsOmited, Side } from './utils';
import {
  additional, cornersArray, objFromKeys,
  R, radialGradient, sidesArray, sumDps,
} from './utils';



export interface ShadowProps {
  /** The color of the shadow when it's right next to the given content, leaving it.
   * Accepts alpha channel.
   *
   * @default '#00000020' */
  startColor?: string;
  /** The color of the shadow at the maximum distance from the content. Accepts alpha channel.
   *
   * It defaults to a transparent color of `startColor`. E.g.: `startColor` is `#f00`, so it defaults to `#f000`. [Reason here](https://github.com/SrBrahma/react-native-shadow-2/issues/31#issuecomment-985578972).
   *
   * @default Transparent startColor */
  finalColor?: string;
  /** How far the shadow goes.
   * @default 10 */
  distance?: number;
  /** The sides that have the shadows drawn. Doesn't include corners.
   *
   * @default ['left', 'right', 'top', 'bottom'] */
  // We are using the raw type here instead of Side/Corner so TypeDoc/Readme output is better for the users, won't be just `Side`.
  sides?: ('left' | 'right' | 'top' | 'bottom')[];
  /** The corners that have the shadows drawn.
   *
   * @default ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] */
  corners?: ('topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight')[];
  /** Moves the shadow. Negative x moves it to the left, negative y moves it up.
   *
   * Accepts `'x%'` values, in relation to the child's size.
   *
   * Setting an offset will default `paintInside` to true.
   *
   * @default [0, 0] */
  offset?: [x: number | string, y: number | string];
  /** If the shadow should be applied inside the external shadows, below the child. `startColor` is used as fill color.
   *
   * You may want this as true when using offset or if your child have some transparency.
   *
   * **The default changes to true if `offset` property is defined.**
   *
   * @default false */
  paintInside?: boolean;
  /** Style of the view that wraps your child component.
   *
   * You may set here the corners radii (e.g. borderTopLeftRadius) and the width/height. */
  style?: StyleProp<ViewStyle>;
  /** Style of the view that wraps the shadow and your child component. */
  containerStyle?: StyleProp<ViewStyle>;
  /** If you don't want the relative sizing and positioning of the shadow on the first render, but only on the second render and
   * beyond with the exact onLayout sizes. This is useful if dealing with radius greater than the sizes, to assure
   * the fully round corners when the sides sizes are unknown and to avoid weird and overflowing shadows on the first render.
   *
   * Note that when true, the shadow will only appear on the second render and beyond.
   *
   * @default false */
  safeRender?: boolean;
  /** Use this when you want your children to ocuppy all available cross-axis/horizontal space.
   *
   * Shortcut to `style={{alignSelf: 'stretch'}}.
   *
   * [Explanation](https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899784537)
   *
   * @default false */
  stretch?: boolean;
  /** If true, won't render the Shadow. Useful for reusing components, as sometimes you may not want shadows.
   *
   * Your children will just be wrapped by two Views, and `containerStyle` and `style` are still applied. Performatic!
   *
   * Note: for performance, contrary to "enabled", we won't set the children's corners radii to the `style` property.
   * This is done in "enabled" to limit Pressable's ripple as we already get those values anyway. */
  disabled?: boolean;
  /** Props for the Shadow's View. You shouldn't need to use this. You may pass `style` to this. */
  shadowViewProps?: ViewProps;
  /** Your child component. */
  children?: React.ReactNode;
}

// For better memoization
const emptyObj = {};
const defaultOffset = [0, 0] as [x: number | string, y: number | string];

export function Shadow(props: ShadowProps): JSX.Element {
  return props.disabled
    ? <DisabledShadow {...props}/>
    : <ShadowInner {...props}/>;
}

function ShadowInner(props: ShadowProps): JSX.Element {
  const isRTL = I18nManager.isRTL;
  const [childLayoutWidth, setChildLayoutWidth] = useState<number | undefined>();
  const [childLayoutHeight, setChildLayoutHeight] = useState<number | undefined>();

  const {
    sides,
    corners,
    startColor: startColorProp = '#00000020',
    finalColor: finalColorProp = colord(startColorProp).alpha(0).toHex(),
    distance: distanceProp = 10,
    style: styleProp,
    safeRender,
    stretch,
    /** Defaults to true if offset is defined, else defaults to false */
    paintInside = props.offset ? true : false,
    children,
    containerStyle,
    offset = defaultOffset,
    shadowViewProps,
  } = props;

  /** Which sides will have shadow. */
  const activeSides: Record<Side, boolean> = useMemo(() => objFromKeys(sidesArray, (k) => sides?.includes(k) ?? true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    sides ? [...sides] : [],
  );

  /** Which corners will have shadow. */
  const activeCorners: Record<Corner, boolean> = useMemo(() => objFromKeys(cornersArray, (k) => corners?.includes(k) ?? true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    corners ? [...corners] : [],
  );

  /** `s` is a shortcut for `style` I am using in another lib of mine (react-native-gev). While currently no one uses it besides me,
   * I believe it may come to be a popular pattern eventually :) */
  const childProps: {style?: ViewStyle; s?: ViewStyle} = (Children.count(children) === 1) ? (Children.only(children) as JSX.Element).props ?? emptyObj : emptyObj;

  const childStyleStr = useMemo(() => JSON.stringify(childProps.style ?? {}), [childProps.style]);
  const childSStr = useMemo(() => JSON.stringify(childProps.s ?? {}), [childProps.s]);

  /** Child's style. */
  const cStyle = useMemo<ViewStyle>(() => {
    return StyleSheet.flatten([JSON.parse(childStyleStr), JSON.parse(childSStr)]);
  }, [childSStr, childStyleStr]);

  /** Child's Radii */
  const cRadii = useMemo(() => {
    return {
      topLeft: cStyle.borderTopLeftRadius ?? cStyle.borderTopStartRadius ?? cStyle.borderRadius,
      topRight: cStyle.borderTopRightRadius ?? cStyle.borderTopEndRadius ?? cStyle.borderRadius,
      bottomLeft: cStyle.borderBottomLeftRadius ?? cStyle.borderBottomStartRadius ?? cStyle.borderRadius,
      bottomRight: cStyle.borderBottomRightRadius ?? cStyle.borderBottomEndRadius ?? cStyle.borderRadius,
    };
  }, [cStyle]);

  const styleStr = useMemo(() => JSON.stringify(styleProp ?? {}), [styleProp]);

  /** Flattened style. */
  const { style, sRadii } = useMemo(() => {
    const style = StyleSheet.flatten(JSON.parse(styleStr));
    if (typeof style.width === 'number')
      style.width = R(style.width);
    if (typeof style.height === 'number')
      style.height = R(style.height);
    return {
      style,
      sRadii: {
        topLeft: style.borderTopLeftRadius ?? style.borderTopStartRadius ?? style.borderRadius,
        topRight: style.borderTopLeftRadius ?? style.borderTopStartRadius ?? style.borderRadius,
        bottomLeft: style.borderTopLeftRadius ?? style.borderTopStartRadius ?? style.borderRadius,
        bottomRight: style.borderTopLeftRadius ?? style.borderTopStartRadius ?? style.borderRadius,
      },
    };
  }, [styleStr]);

  const width = style.width ?? childLayoutWidth ?? '100%'; // '100%' sometimes will lead to gaps. Child's size don't lie.
  const height = style.height ?? childLayoutHeight ?? '100%';

  const radii: CornerRadius = useMemo(() => sanitizeRadii({
    width, height, radii: {
      topLeft: sRadii.topLeft ?? cRadii.topLeft,
      topRight: sRadii.topRight ?? cRadii.topRight,
      bottomLeft: sRadii.bottomLeft ?? cRadii.bottomLeft,
      bottomRight: sRadii.bottomRight ?? cRadii.bottomRight,
    },
  }), [
    width, height,
    sRadii.topLeft, sRadii.topRight, sRadii.bottomLeft, sRadii.bottomRight,
    cRadii.topLeft, cRadii.topRight, cRadii.bottomLeft, cRadii.bottomRight,
  ]);

  const { topLeft, topRight, bottomLeft, bottomRight } = radii;

  const shadow = useMemo(() => getShadow({
    topLeft, topRight, bottomLeft, bottomRight, width, height,
    isRTL, distanceProp, startColorProp, finalColorProp, paintInside,
    safeRender, activeSides, activeCorners,
  }), [
    width, height, topLeft, topRight, bottomLeft, bottomRight,
    distanceProp, startColorProp, finalColorProp,
    paintInside, activeCorners, activeSides, isRTL, safeRender,
  ]);

  // Not yet sure if we should memo this.
  return getResult({
    shadow, children,
    stretch, offset, radii,
    containerStyle, style, shadowViewProps,
    setChildLayoutWidth, setChildLayoutHeight,
  });
}



/** We make some effort for this to be likely memoized */
function sanitizeRadii({ width, height, radii }: {
  width: string | number;
  height: string | number;
  /** Not yet treated. May be negative / undefined */
  radii: {
    topLeft: number | undefined;
    topRight: number | undefined;
    bottomLeft: number | undefined;
    bottomRight: number | undefined;
  };
}): CornerRadius {
  console.log('sanitizeRadii');
  /** Round and zero negative radius values */
  let radiiSanitized = objFromKeys(cornersArray, (k) => R(Math.max(radii[k] ?? 0, 0)));

  if (typeof width === 'number' && typeof height === 'number') {
    // https://css-tricks.com/what-happens-when-border-radii-overlap/
    // Note that the tutorial above doesn't mention the specification of minRatio < 1 but it's required as said on spec and will malfunction without it.
    const minRatio = Math.min(
      width / (radiiSanitized.topLeft + radiiSanitized.topRight),
      height / (radiiSanitized.topRight + radiiSanitized.bottomRight),
      width / (radiiSanitized.bottomLeft + radiiSanitized.bottomRight),
      height / (radiiSanitized.topLeft + radiiSanitized.bottomLeft),
    );
    if (minRatio < 1)
      radiiSanitized = objFromKeys(cornersArray, (k) => R(radiiSanitized[k] * minRatio));
  }

  return radiiSanitized;
}


/** The SVG parts. */
function getShadow({
  safeRender, width, height, isRTL, distanceProp, startColorProp, finalColorProp,
  topLeft, topRight, bottomLeft, bottomRight,
  activeSides, activeCorners, paintInside,
}: {
  safeRender: boolean | undefined;
  width: string | number;
  height: string | number;
  isRTL: boolean;
  distanceProp: number;
  startColorProp: string;
  finalColorProp: string;
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  activeSides: Record<Side, boolean>;
  activeCorners: Record<Corner, boolean>;
  paintInside: boolean;
}): JSX.Element | null {
  console.log('getShadow');
  // Skip if using safeRender and we still don't have the exact sizes, if we are still on the first render using the relative sizes.
  if (safeRender && (typeof width === 'string' || typeof height === 'string'))
    return null;

  const distance = R(Math.max(distanceProp, 0)); // Min val as 0

  // Quick return if not going to show up anything
  if (!distance && !paintInside)
    return null;

  const distanceWithAdditional = distance + additional;

  /** To be used inside Svg style */
  const rtlStyle = isRTL && { transform: [{ scaleX: -1 }] };
  /** To be used inside Svg style.transform */
  const rtlTransform = isRTL ? [{ scaleX: -1 }] : [];

  /** Will (+ additional), only if its value isn't '100%'. [*4] */
  const widthWithAdditional = typeof width === 'string' ? width : width + additional;
  /** Will (+ additional), only if its value isn't '100%'. [*4] */
  const heightWithAdditional = typeof height === 'string' ? height : height + additional;

  const startColord = colord(startColorProp);
  const finalColord = colord(finalColorProp);

  // [*1]: Seems that SVG in web accepts opacity in hex color, but in mobile gradient doesn't.
  // So we remove the opacity from the color, and only apply the opacity in stopOpacity, so in web
  // it isn't applied twice.
  const startColorWoOpacity = startColord.alpha(1).toHex();
  const finalColorWoOpacity = finalColord.alpha(1).toHex();

  const startColorOpacity = startColord.alpha();
  const finalColorOpacity = finalColord.alpha();

  // Fragment wasn't working for some reason, so, using array.
  const linearGradient = [
    // [*1] In mobile, it's required for the alpha to be set in opacity prop to work.
    // In web, smaller offsets needs to come before, so offset={0} definition comes first.
    <Stop offset={0} stopColor={startColorWoOpacity} stopOpacity={startColorOpacity} key='1'/>,
    <Stop offset={1} stopColor={finalColorWoOpacity} stopOpacity={finalColorOpacity} key='2'/>,
  ];

  const radialGradient2 = (p: RadialGradientPropsOmited) => radialGradient({
    ...p, startColorWoOpacity, startColorOpacity, finalColorWoOpacity, finalColorOpacity, paintInside,
  });

  const cornerShadowRadius: CornerRadiusShadow = {
    topLeftShadow: sumDps(topLeft, distance),
    topRightShadow: sumDps(topRight, distance),
    bottomLeftShadow: sumDps(bottomLeft, distance),
    bottomRightShadow: sumDps(bottomRight, distance),
  };

  const { topLeftShadow, topRightShadow, bottomLeftShadow, bottomRightShadow } = cornerShadowRadius;

  return (
    <>
      {/* Skip sides if we don't have a distance. */}
      {distance > 0 && <>
        {/* Sides */}
        {activeSides.left && <Svg
          width={distanceWithAdditional} height={heightWithAdditional}
          style={{ position: 'absolute', left: -distance, top: topLeft, ...rtlStyle }}
        >
          <Defs><LinearGradient id='left' x1='1' y1='0' x2='0' y2='0'>{linearGradient}</LinearGradient></Defs>
          {/* I was using a Mask here to remove part of each side (same size as now, sum of related corners), but,
                  just moving the rectangle outside its viewbox is already a mask!! -> svg overflow is cutten away. <- */}
          <Rect width={distance} height={height} fill='url(#left)' y={-sumDps(topLeft, bottomLeft)}/>
        </Svg>}
        {activeSides.right && <Svg
          width={distanceWithAdditional} height={heightWithAdditional}
          style={{ position: 'absolute', left: width, top: topRight, ...rtlStyle }}
        >
          <Defs><LinearGradient id='right' x1='0' y1='0' x2='1' y2='0'>{linearGradient}</LinearGradient></Defs>
          <Rect width={distance} height={height} fill='url(#right)' y={-sumDps(topRight, bottomRight)}/>
        </Svg>}
        {activeSides.bottom && <Svg
          width={widthWithAdditional} height={distanceWithAdditional}
          style={{ position: 'absolute', top: height, left: bottomLeft, ...rtlStyle }}
        >
          <Defs><LinearGradient id='bottom' x1='0' y1='0' x2='0' y2='1'>{linearGradient}</LinearGradient></Defs>
          <Rect width={width} height={distance} fill='url(#bottom)' x={-sumDps(bottomLeft, bottomRight)}/>
        </Svg>}
        {activeSides.top && <Svg
          width={widthWithAdditional} height={distanceWithAdditional}
          style={{ position: 'absolute', top: -distance, left: topLeft, ...rtlStyle }}
        >
          <Defs><LinearGradient id='top' x1='0' y1='1' x2='0' y2='0'>{linearGradient}</LinearGradient></Defs>
          <Rect width={width} height={distance} fill='url(#top)' x={-sumDps(topLeft, topRight)}/>
        </Svg>}
      </>}


      {/* Corners */}
      {/* The anchor for the svgs path is the top left point in the corner square.
              The starting point is the clockwise external arc init point. */}
      {/* Checking topLeftShadowEtc > 0 due to https://github.com/SrBrahma/react-native-shadow-2/issues/47. */}
      {activeCorners.topLeft && topLeftShadow > 0 && <Svg width={topLeftShadow + additional} height={topLeftShadow + additional}
        style={{ position: 'absolute', top: -distance, left: -distance, ...rtlStyle }}
      >
        <Defs>{radialGradient2({ id: 'topLeft', top: true, left: true, radius: topLeft, shadowRadius: topLeftShadow })}</Defs>
        <Rect fill='url(#topLeft)' width={topLeftShadow} height={topLeftShadow}/>
      </Svg>}
      {activeCorners.topRight && topRightShadow > 0 && <Svg width={topRightShadow + additional} height={topRightShadow + additional}
        style={{
          position: 'absolute', top: -distance, left: width,
          transform: [{ translateX: isRTL ? topRight : -topRight }, ...rtlTransform],
        }}
      >
        <Defs>{radialGradient2({ id: 'topRight', top: true, left: false, radius: topRight, shadowRadius: topRightShadow })}</Defs>
        <Rect fill='url(#topRight)' width={topRightShadow} height={topRightShadow}/>
      </Svg>}
      {activeCorners.bottomLeft && bottomLeftShadow > 0 && <Svg width={bottomLeftShadow + additional} height={bottomLeftShadow + additional}
        style={{ position: 'absolute', top: height, left: -distance, transform: [{ translateY: -bottomLeft }, ...rtlTransform] }}
      >
        <Defs>{radialGradient2({ id: 'bottomLeft', top: false, left: true, radius: bottomLeft, shadowRadius: bottomLeftShadow })}</Defs>
        <Rect fill='url(#bottomLeft)' width={bottomLeftShadow} height={bottomLeftShadow}/>
      </Svg>}
      {activeCorners.bottomRight && bottomRightShadow > 0 && <Svg width={bottomRightShadow + additional} height={bottomRightShadow + additional}
        style={{
          position: 'absolute', top: height, left: width,
          transform: [{ translateX: isRTL ? bottomRight : -bottomRight }, { translateY: -bottomRight }, ...rtlTransform],
        }}
      >
        <Defs>{radialGradient2({ id: 'bottomRight', top: false, left: false, radius: bottomRight, shadowRadius: bottomRightShadow })}</Defs>
        <Rect fill='url(#bottomRight)' width={bottomRightShadow} height={bottomRightShadow}/>
      </Svg>}

      {/* Paint the inner area, so we can offset it.
      [*2]: I tried redrawing the inner corner arc, but there would always be a small gap between the external shadows
      and this internal shadow along the curve. So, instead we dont specify the inner arc on the corners when
      paintBelow, but just use a square inner corner. And here we will just mask those squares in each corner. */}
      {paintInside && <Svg width={widthWithAdditional} height={heightWithAdditional} style={{ position: 'absolute', ...rtlStyle }}>
        {(typeof width === 'number' && typeof height === 'number')
        // Maybe due to how react-native-svg handles masks in iOS, the paintInside would have gaps: https://github.com/SrBrahma/react-native-shadow-2/issues/36
        // We use Path as workaround to it.
          ? (
            <Path
              fill={startColorWoOpacity} fillOpacity={startColorOpacity}
              d={`M0,${topLeft} v${height - bottomLeft - topLeft} h${bottomLeft} v${bottomLeft} h${width - bottomLeft - bottomRight} v${-bottomRight} h${bottomRight} v${-height + bottomRight + topRight} h${-topRight} v${-topRight} h${-width + topLeft + topRight} v${topLeft} Z`}
            />)
          : (<>
            <Defs>
              <Mask id='maskPaintBelow'>
                {/* Paint all white, then black on border external areas to erase them */}
                <Rect width={width} height={height} fill='#fff'/>
                {/* Remove the corners, as squares. Could use <Path/>, but this way seems to be more maintainable. */}
                <Rect width={topLeft} height={topLeft} fill='#000'/>
                <Rect width={topRight} height={topRight} x={width} transform={`translate(${-topRight}, 0)`} fill='#000'/>
                <Rect width={bottomLeft} height={bottomLeft} y={height} transform={`translate(0, ${-bottomLeft})`} fill='#000'/>
                <Rect width={bottomRight} height={bottomRight} x={width} y={height} transform={`translate(${-bottomRight}, ${-bottomRight})`} fill='#000'/>
              </Mask>
            </Defs>
            <Rect width={width} height={height} mask='url(#maskPaintBelow)' fill={startColorWoOpacity} fillOpacity={startColorOpacity}/>
          </>)}
      </Svg>}
    </>
  );
}


function getResult({
  shadow, stretch, setChildLayoutWidth, setChildLayoutHeight,
  containerStyle, children, style,
  radii, offset, shadowViewProps,
}: {
  radii: CornerRadius;
  containerStyle: StyleProp<ViewStyle>;
  shadow: JSX.Element | null;
  children: any;
  style: ViewStyle; // Already flattened
  stretch: boolean | undefined;
  setChildLayoutWidth: React.Dispatch<React.SetStateAction<number | undefined>>;
  setChildLayoutHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  offset: [x: number | string, y: number | string];
  shadowViewProps: ShadowProps['shadowViewProps'];
}): JSX.Element {
  return (
    // pointerEvents: https://github.com/SrBrahma/react-native-shadow-2/issues/24
    <View style={containerStyle} pointerEvents='box-none'>
      <View pointerEvents='none' {...shadowViewProps} style={[
        StyleSheet.absoluteFillObject, { left: offset[0], top: offset[1] }, shadowViewProps?.style,
      ]}
      >
        {shadow}
      </View>
      <View
        pointerEvents='box-none'
        style={[
          {
            // Without alignSelf: 'flex-start', if your Shadow component had a sibling under the same View, the shadow would try to have the same size of the sibling,
            // being it for example a text below the shadowed component. https://imgur.com/a/V6ZV0lI, https://github.com/SrBrahma/react-native-shadow-2/issues/7#issuecomment-899764882
            alignSelf: stretch ? 'stretch' : 'flex-start',
            // We are defining here the radii so when using radius props it also affects the backgroundColor and Pressable ripples are properly contained.
            borderTopLeftRadius: radii.topLeft,
            borderTopRightRadius: radii.topRight,
            borderBottomLeftRadius: radii.bottomLeft,
            borderBottomRightRadius: radii.bottomRight,
          },
          style, // FIXME problematic radius? would topStart overwrite topLeft?
        ]}
        onLayout={(e) => {
          // For some strange reason, attaching conditionally the onLayout wasn't working on condition change,
          // so we do the check before the state change.
          // [web] [*3]: the width/height we get here is already rounded by RN, even if the real size according to the browser
          // inspector is decimal. It will round up if (>= .5), else, down.
          const layout = e.nativeEvent.layout;
          if (style.width === undefined) // Is this check good?
            setChildLayoutWidth(layout.width); // In web to round decimal values to integers. In mobile it's already rounded. (?)
          if (style.height === undefined)
            setChildLayoutHeight(layout.height);
        }}
      >
        {children}
      </View>
    </View>
  );
}


function DisabledShadow({ stretch, containerStyle, children, style }: {
  containerStyle?: StyleProp<ViewStyle>;
  children?: any;
  style?: StyleProp<ViewStyle>;
  stretch?: boolean;
}): JSX.Element {
  return (
    <View style={containerStyle} pointerEvents='box-none'>
      <View
        pointerEvents='box-none'
        style={[{
          alignSelf: stretch ? 'stretch' : 'flex-start',
        },
        style]}
      >
        {children}
      </View>
    </View>
  );
}

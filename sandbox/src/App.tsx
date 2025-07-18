// Sandbox to test the library.
// Using a copy of the lib code here.
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  I18nManager,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Slider } from '@sharcoux/slider';
import { PageScrollView } from 'pagescrollview';
import tinycolor from 'tinycolor2';
import { Shadow } from './shadow/index'; // Aliased in Sandbox in dev.

const defaults = {
  distace: 50,
  borderRadius: 30,
  width: 200,
  height: 200,
  startColor: tinycolor('#00000020').toHex8String(),
  finalColor: tinycolor('#0000').toHex8String(),
  childColor: tinycolor('#fff').toHex8String(), // tinycolor('#fff').toHex8String(),
};

export const App: React.FC = () => {
  const [distance, setDistance] = useState(defaults.distace);

  const [borderRadii, setBorderRadii] = useState<{
    borderBottomLeftRadius: number;
    borderBottomRightRadius: number;
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
  }>({
    borderBottomLeftRadius: defaults.borderRadius,
    borderBottomRightRadius: defaults.borderRadius,
    borderTopLeftRadius: defaults.borderRadius,
    borderTopRightRadius: defaults.borderRadius,
  });

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [size, setSize] = useState([defaults.width, defaults.height] as [number, number]);
  const [doUseSizeStyle, setDoUseSizeProp] = useState(true);

  const [childWidth, setChildWidth] = useState(defaults.width);
  const [childHeight, setChildHeight] = useState(defaults.height);

  const [startColor, setStartColor] = useState(defaults.startColor);
  const [finalColor, setFinalColor] = useState(defaults.finalColor);
  const [childColor, setChildColor] = useState(defaults.childColor);

  const [disabled, setDisabled] = useState(false);

  const [rtl, setRtl] = useState(false);

  useEffect(() => I18nManager.forceRTL(rtl), [rtl]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor='#222' />
        <PageScrollView style={styles.container}>
          <Text style={styles.title}>{`react-native-shadow-2 sandbox`}</Text>
          <Text
            style={styles.subtitle}
          >{`By ftzi @ https://github.com/ftzi/react-native-shadow-2`}</Text>

          <View style={styles.sandbox}>
            {/** Can't get this scroll to work properly in web */}
            <View style={styles.settings}>
              {/** View necessary so the settings won't grow too large in width */}
              <View>
                <MySlider
                  name='Style Width'
                  step={0.1}
                  range={[0, 200]}
                  value={size[0]}
                  onValueChange={(v) => setSize([v, size[1]])}
                />
                <MySlider
                  name='Style Height'
                  step={0.1}
                  range={[0, 200]}
                  value={size[1]}
                  onValueChange={(v) => setSize([size[0], v])}
                />
                <MySwitch
                  name='Use Style Sizes'
                  value={doUseSizeStyle}
                  onValueChange={setDoUseSizeProp}
                  description={
                    "Use the style's sizes (width and\nheight above), else obtains the child's size."
                  }
                />
                <MySlider
                  name='Child Width'
                  step={0.1}
                  range={[0, 200]}
                  value={childWidth}
                  onValueChange={setChildWidth}
                />
                <MySlider
                  name='Child Height'
                  step={0.1}
                  range={[0, 200]}
                  value={childHeight}
                  onValueChange={setChildHeight}
                />
                <MySlider
                  name='Distance'
                  value={distance}
                  onValueChange={setDistance}
                  range={[-10, 100]}
                  step={0.1} // min -10 to show < 0 won't do anything
                />
                {/* <MySlider name='Border Radius' value={borderRadius} onValueChange={setBorderRadius}
                  range={[-10, 100]} step={0.1} // min -10 to show < 0 won't do anything
                /> */}
                <MySlider
                  name='Top Start'
                  value={borderRadii.borderTopLeftRadius}
                  onValueChange={(borderTopLeftRadius) =>
                    setBorderRadii({ ...borderRadii, borderTopLeftRadius })
                  }
                  range={[-10, 100]}
                  step={0.1}
                />
                <MySlider
                  name='Top End'
                  value={borderRadii.borderTopRightRadius}
                  onValueChange={(borderTopRightRadius) =>
                    setBorderRadii({ ...borderRadii, borderTopRightRadius })
                  }
                  range={[-10, 100]}
                  step={0.1}
                />
                <MySlider
                  name='Bottom Start'
                  value={borderRadii.borderBottomLeftRadius}
                  onValueChange={(borderBottomLeftRadius) =>
                    setBorderRadii({ ...borderRadii, borderBottomLeftRadius })
                  }
                  range={[-10, 100]}
                  step={0.1}
                />
                <MySlider
                  name='Bottom End'
                  value={borderRadii.borderBottomRightRadius}
                  onValueChange={(borderBottomRightRadius) =>
                    setBorderRadii({ ...borderRadii, borderBottomRightRadius })
                  }
                  range={[-10, 100]}
                  step={0.1}
                />
                <MySlider
                  name='Offset X'
                  range={[-20, 20]}
                  value={offsetX}
                  onValueChange={setOffsetX}
                />
                <MySlider
                  name='Offset Y'
                  range={[-20, 20]}
                  value={offsetY}
                  onValueChange={setOffsetY}
                />

                <NameValue name='Start Color' value={startColor} valueMonospace />
                <TextInput
                  style={styles.textInput}
                  defaultValue={defaults.startColor}
                  autoCorrect={false}
                  onChangeText={(text) => {
                    const color = tinycolor(text);
                    if (color.isValid())
                      // Only change if valid input
                      setStartColor(color.toHex8String());
                  }}
                />

                <NameValue name='Final Color' value={finalColor} valueMonospace />
                <TextInput
                  style={styles.textInput}
                  defaultValue={defaults.finalColor}
                  autoCorrect={false}
                  onChangeText={(text) => {
                    const color = tinycolor(text);
                    if (color.isValid()) setFinalColor(color.toHex8String());
                  }}
                />

                <NameValue name='Child Color' value={childColor} valueMonospace />
                <TextInput
                  style={styles.textInput}
                  defaultValue={defaults.childColor}
                  autoCorrect={false}
                  onChangeText={(text) => {
                    const color = tinycolor(text);
                    if (color.isValid()) setChildColor(color.toHex8String());
                  }}
                />
                <MySwitch name='Use RTL' value={rtl} onValueChange={setRtl} />
                <MySwitch name='Disabled' value={disabled} onValueChange={setDisabled} />
              </View>
            </View>
            {/* Max child width is 200 and max dist is 100. Total max is 400. */}
            <View
              style={{ width: 420, height: 420, justifyContent: 'center', alignItems: 'center' }}
            >
              <Shadow
                distance={distance}
                startColor={startColor}
                endColor={finalColor}
                offset={offsetX || offsetY ? [offsetX, offsetY] : undefined} // To test paintInside default
                containerStyle={{ margin: 100 }}
                disabled={disabled}
                style={
                  doUseSizeStyle && {
                    backgroundColor: childColor,
                    width: size[0],
                    height: size[1],
                  }
                }
              >
                <View
                  style={[
                    {
                      backgroundColor: childColor,
                      ...borderRadii,
                    },
                    !doUseSizeStyle && { width: childWidth, height: childHeight },
                  ]}
                />
              </Shadow>
            </View>
          </View>
        </PageScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const NameValue: React.FC<{
  name: string;
  value: string | number | boolean | undefined;
  valueMonospace?: boolean;
}> = ({ name, value, valueMonospace = false }) => {
  const prettyValue =
    typeof value === 'number' ? value.toFixed(1).replace(/[.,]0+$/, '') : String(value); // https://stackoverflow.com/a/5623195/10247962
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
      }}
    >
      <Text style={{ fontSize: 16 }}>{name}</Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          fontFamily: valueMonospace ? 'monospace' : undefined,
        }}
      >
        {prettyValue}
      </Text>
    </View>
  );
};

const MySlider: React.FC<{
  name: string;
  step?: number;
  range: [min: number, max: number];
  value: number;
  onValueChange: (value: number) => void;
}> = ({ name, step = 1, range, value, onValueChange }) => {
  return (
    <View style={{ marginBottom: 18 }}>
      <NameValue {...{ name, value }} />
      <View style={{ flexDirection: 'row' }}>
        <Pressable
          onPress={() => onValueChange(value - step)}
          style={({ pressed }) => [styles.decIncButton, pressed && { backgroundColor: '#bbb' }]}
        >
          <Text selectable={false} style={{ fontSize: 16, fontWeight: 'bold' }}>
            {'-'}
          </Text>
        </Pressable>
        <Slider
          style={{ width: 140, marginHorizontal: 20 }}
          minimumValue={range[0]}
          maximumValue={range[1]}
          {...{ step, value, onValueChange }}
        />
        <Pressable
          onPress={() => onValueChange(value + step)}
          style={({ pressed }) => [styles.decIncButton, pressed && { backgroundColor: '#bbb' }]}
        >
          <Text selectable={false} style={{ fontSize: 16, fontWeight: 'bold' }}>
            {'+'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const MySwitch: React.FC<{
  name: string;
  value: boolean;
  description?: string;
  onValueChange: (value: boolean) => void;
}> = ({ name, onValueChange, value, description }) => {
  return (
    <View style={{ marginTop: 2, marginBottom: 18, flexShrink: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 16 }}>{name}</Text>
        <Switch value={value} onValueChange={onValueChange} />
      </View>
      <View style={{ marginTop: 4, marginLeft: 8 }}>
        {/* I couldn't fking stop the text from growing the settings view, so I made this workaround. */}
        {description?.split('\n')?.map((t) => (
          <Text style={styles.description} numberOfLines={1} key={t}>
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
};

// Flex all the way up to settings ScrollView: https://necolas.github.io/react-native-web/docs/scroll-view/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 30,
    marginTop: 20,
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  sandbox: {
    flex: 1,
    flexWrap: 'wrap-reverse', // to make it responsive, with the shadow component being above the settings on small screens
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignContent: 'space-between',
    justifyContent: 'space-evenly',
    paddingBottom: 40,
  },
  settings: {
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 40,
    paddingVertical: 30,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    color: '#222',
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  textInput: {
    backgroundColor: '#fff',
    borderColor: '#222',
    borderRadius: 3,
    paddingVertical: 3,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingHorizontal: 8,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  decIncButton: {
    backgroundColor: '#fff',
    padding: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});

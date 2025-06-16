import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import OAuthService from '../services/oauthService';

// Brand SVG Components
const GoogleLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

const OutlookLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 1831.085 1703.335">
    <Defs>
      <LinearGradient id="SVGID_1_" x1="1128.4584" y1="811.0833" x2="1128.4584" y2="1.9982" gradientTransform="matrix(1 0 0 -1 0 1705.3334)">
        <Stop offset="0" stopColor="#35B8F1"/>
        <Stop offset="1" stopColor="#28A8EA"/>
      </LinearGradient>
      <LinearGradient id="SVGID_2_" x1="162.7469" y1="1383.0741" x2="774.0864" y2="324.2592" gradientTransform="matrix(1 0 0 -1 0 1705.3334)">
        <Stop offset="0" stopColor="#1784D9"/>
        <Stop offset="0.5" stopColor="#107AD5"/>
        <Stop offset="1" stopColor="#0A63C9"/>
      </LinearGradient>
    </Defs>
    <Path fill="#0A2767" d="M1831.083,894.25c0.1-14.318-7.298-27.644-19.503-35.131h-0.213l-0.767-0.426l-634.492-375.585  c-2.74-1.851-5.583-3.543-8.517-5.067c-24.498-12.639-53.599-12.639-78.098,0c-2.934,1.525-5.777,3.216-8.517,5.067L446.486,858.693  l-0.766,0.426c-19.392,12.059-25.337,37.556-13.278,56.948c3.553,5.714,8.447,10.474,14.257,13.868l634.492,375.585  c2.749,1.835,5.592,3.527,8.517,5.068c24.498,12.639,53.599,12.639,78.098,0c2.925-1.541,5.767-3.232,8.517-5.068l634.492-375.585  C1823.49,922.545,1831.228,908.923,1831.083,894.25z"/>
    <Path fill="#0364B8" d="M520.453,643.477h416.38v381.674h-416.38V643.477z M1745.917,255.5V80.908  c1-43.652-33.552-79.862-77.203-80.908H588.204C544.552,1.046,510,37.256,511,80.908V255.5l638.75,170.333L1745.917,255.5z"/>
    <Path fill="#0078D4" d="M511,255.5h425.833v383.25H511V255.5z"/>
    <Path fill="#28A8EA" d="M1362.667,255.5H936.833v383.25L1362.667,1022h383.25V638.75L1362.667,255.5z"/>
    <Path fill="#0078D4" d="M936.833,638.75h425.833V1022H936.833V638.75z"/>
    <Path fill="#0364B8" d="M936.833,1022h425.833v383.25H936.833V1022z"/>
    <Path fill="#14447D" d="M520.453,1025.151h416.38v346.969h-416.38V1025.151z"/>
    <Path fill="#0078D4" d="M1362.667,1022h383.25v383.25h-383.25V1022z"/>
    <Path fill="url(#SVGID_1_)" d="M1811.58,927.593l-0.809,0.426l-634.492,356.848c-2.768,1.703-5.578,3.321-8.517,4.769  c-10.777,5.132-22.481,8.029-34.407,8.517l-34.663-20.27c-2.929-1.47-5.773-3.105-8.517-4.897L447.167,906.003h-0.298  l-21.036-11.753v722.384c0.328,48.196,39.653,87.006,87.849,86.7h1230.914c0.724,0,1.363-0.341,2.129-0.341  c10.18-0.651,20.216-2.745,29.808-6.217c4.145-1.756,8.146-3.835,11.966-6.217c2.853-1.618,7.75-5.152,7.75-5.152  c21.814-16.142,34.726-41.635,34.833-68.772V894.25C1831.068,908.067,1823.616,920.807,1811.58,927.593z"/>
    <Path opacity="0.5" fill="#0A2767" d="M1797.017,891.397v44.287l-663.448,456.791L446.699,906.301  c0-0.235-0.191-0.426-0.426-0.426l0,0l-63.023-37.899v-31.938l25.976-0.426l54.932,31.512l1.277,0.426l4.684,2.981  c0,0,645.563,368.346,647.267,369.197l24.698,14.478c2.129-0.852,4.258-1.703,6.813-2.555  c1.278-0.852,640.879-360.681,640.879-360.681L1797.017,891.397z"/>
    <Path fill="#1490DF" d="M1811.58,927.593l-0.809,0.468l-634.492,356.848c-2.768,1.703-5.578,3.321-8.517,4.769  c-24.641,12.038-53.457,12.038-78.098,0c-2.918-1.445-5.76-3.037-8.517-4.769L446.657,928.061l-0.766-0.468  c-12.25-6.642-19.93-19.409-20.057-33.343v722.384c0.305,48.188,39.616,87.004,87.803,86.7c0.001,0,0.002,0,0.004,0h1229.636  c48.188,0.307,87.5-38.509,87.807-86.696c0-0.001,0-0.002,0-0.004V894.25C1831.068,908.067,1823.616,920.807,1811.58,927.593z"/>
    <Path opacity="0.1" d="M1185.52,1279.629l-9.496,5.323c-2.752,1.752-5.595,3.359-8.517,4.812  c-10.462,5.135-21.838,8.146-33.47,8.857l241.405,285.479l421.107,101.476c11.539-8.716,20.717-20.178,26.7-33.343L1185.52,1279.629  z"/>
    <Path opacity="0.05" d="M1228.529,1255.442l-52.505,29.51c-2.752,1.752-5.595,3.359-8.517,4.812  c-10.462,5.135-21.838,8.146-33.47,8.857l113.101,311.838l549.538,74.989c21.649-16.254,34.394-41.743,34.407-68.815v-9.326  L1228.529,1255.442z"/>
    <Path fill="#28A8EA" d="M514.833,1703.333h1228.316c18.901,0.096,37.335-5.874,52.59-17.033l-697.089-408.331  c-2.929-1.47-5.773-3.105-8.517-4.897L447.125,906.088h-0.298l-20.993-11.838v719.914  C425.786,1663.364,465.632,1703.286,514.833,1703.333C514.832,1703.333,514.832,1703.333,514.833,1703.333z"/>
    <Path opacity="0.1" d="M1022,418.722v908.303c-0.076,31.846-19.44,60.471-48.971,72.392  c-9.148,3.931-19,5.96-28.957,5.962H425.833V383.25H511v-42.583h433.073C987.092,340.83,1021.907,375.702,1022,418.722z"/>
    <Path opacity="0.2" d="M979.417,461.305v908.302c0.107,10.287-2.074,20.469-6.388,29.808  c-11.826,29.149-40.083,48.273-71.54,48.417H425.833V383.25h475.656c12.356-0.124,24.533,2.958,35.344,8.943  C962.937,405.344,979.407,432.076,979.417,461.305z"/>
    <Path opacity="0.2" d="M979.417,461.305v823.136c-0.208,43-34.928,77.853-77.927,78.225H425.833V383.25  h475.656c12.356-0.124,24.533,2.958,35.344,8.943C962.937,405.344,979.407,432.076,979.417,461.305z"/>
    <Path opacity="0.2" d="M936.833,461.305v823.136c-0.046,43.067-34.861,78.015-77.927,78.225H425.833  V383.25h433.072c43.062,0.023,77.951,34.951,77.927,78.013C936.833,461.277,936.833,461.291,936.833,461.305z"/>
    <Path fill="url(#SVGID_2_)" d="M78.055,383.25h780.723c43.109,0,78.055,34.947,78.055,78.055v780.723  c0,43.109-34.946,78.055-78.055,78.055H78.055c-43.109,0-78.055-34.947-78.055-78.055V461.305  C0,418.197,34.947,383.25,78.055,383.25z"/>
    <Path fill="#FFFFFF" d="M243.96,710.631c19.238-40.988,50.29-75.289,89.17-98.495c43.057-24.651,92.081-36.94,141.675-35.515  c45.965-0.997,91.321,10.655,131.114,33.683c37.414,22.312,67.547,55.004,86.742,94.109c20.904,43.09,31.322,90.512,30.405,138.396  c1.013,50.043-9.706,99.628-31.299,144.783c-19.652,40.503-50.741,74.36-89.425,97.388c-41.327,23.734-88.367,35.692-136.011,34.578  c-46.947,1.133-93.303-10.651-134.01-34.067c-37.738-22.341-68.249-55.07-87.892-94.28c-21.028-42.467-31.57-89.355-30.745-136.735  C212.808,804.859,223.158,755.686,243.96,710.631z M339.006,941.858c10.257,25.912,27.651,48.385,50.163,64.812  c22.93,16.026,50.387,24.294,78.353,23.591c29.783,1.178,59.14-7.372,83.634-24.358c22.227-16.375,39.164-38.909,48.715-64.812  c10.677-28.928,15.946-59.572,15.543-90.404c0.33-31.127-4.623-62.084-14.649-91.554c-8.855-26.607-25.246-50.069-47.182-67.537  c-23.88-17.79-53.158-26.813-82.91-25.55c-28.572-0.74-56.644,7.593-80.184,23.804c-22.893,16.496-40.617,39.168-51.1,65.365  c-23.255,60.049-23.376,126.595-0.341,186.728L339.006,941.858z"/>
    <Path fill="#50D9FF" d="M1362.667,255.5h383.25v383.25h-383.25V255.5z"/>
  </Svg>
);

const AppleLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
      fill="#000000"
    />
  </Svg>
);

const SlackLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
      fill="#E01E5A"
    />
    <Path
      d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
      fill="#36C5F0"
    />
    <Path
      d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
      fill="#2EB67D"
    />
    <Path
      d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
      fill="#ECB22E"
    />
  </Svg>
);

const AsanaLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="asanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFB900" />
        <Stop offset="60%" stopColor="#F95D8F" />
        <Stop offset="100%" stopColor="#F95353" />
      </LinearGradient>
    </Defs>
    <Circle cx="12" cy="5" r="4" fill="url(#asanaGradient)" />
    <Circle cx="7" cy="15" r="4" fill="url(#asanaGradient)" />
    <Circle cx="17" cy="15" r="4" fill="url(#asanaGradient)" />
  </Svg>
);

const ClickUpLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 54.8 65.8">
    <Defs>
      <LinearGradient id="SVGID_1_" x1="0" y1="15.0492" x2="54.8446" y2="15.0492" gradientTransform="matrix(1 0 0 -1 0 69.3604)">
        <Stop offset="0" stopColor="#8930FD" />
        <Stop offset="1" stopColor="#49CCF9" />
      </LinearGradient>
      <LinearGradient id="SVGID_2_" x1="1.1953" y1="53.166" x2="53.7447" y2="53.166" gradientTransform="matrix(1 0 0 -1 0 69.3604)">
        <Stop offset="0" stopColor="#FF02F0" />
        <Stop offset="1" stopColor="#FFC800" />
      </LinearGradient>
    </Defs>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="url(#SVGID_1_)"
      d="M0,50.6l10.1-7.8c5.4,7,11.1,10.3,17.4,10.3c6.3,0,11.9-3.2,17-10.2l10.3,7.6c-7.4,10-16.6,15.3-27.3,15.3
      C16.9,65.8,7.6,60.5,0,50.6z"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      fill="url(#SVGID_2_)"
      d="M27.5,16.9l-18,15.5l-8.3-9.7L27.6,0l26.2,22.7l-8.4,9.6L27.5,16.9z"
    />
  </Svg>
);

const AppleHealthLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="SVGID_1_" x1="166.2225" y1="758.5908" x2="166.2225" y2="757.0913" gradientTransform="matrix(28 0 0 -24.5 -4594.5 18605.5)">
        <Stop offset="0" stopColor="#FF61AD"/>
        <Stop offset="1" stopColor="#FF2719"/>
      </LinearGradient>
    </Defs>
    <Path 
      fill="#FFFFFF" 
      d="M63.6,5c9,0,13.5,0,18.4,1.5c5.3,1.9,9.5,6.1,11.4,11.4C95,22.8,95,27.4,95,36.4v27.2   c0,9,0,13.5-1.5,18.4c-1.9,5.3-6.1,9.5-11.4,11.4C77.1,95,72.6,95,63.6,95H36.4c-9,0-13.5,0-18.4-1.5C12.6,91.5,8.5,87.4,6.5,82   C5,77.2,5,72.7,5,63.6V36.4c0-9,0-13.5,1.5-18.4C8.5,12.7,12.6,8.5,18,6.6C22.8,5,27.3,5,36.4,5H63.6z" 
    />
    <Path 
      fill="url(#SVGID_1_)" 
      d="M80.7,32c0-6.8-5.2-12-11.2-12c-4.2,0-7.6,1.4-9.7,4.5c-2.1-3.1-5.5-4.5-9-4.5c-6.8,0-12,5.2-12,12   c0-0.3,0-0.2,0,0c0-0.1,0,0,0,0c0,10.1,9.7,20.3,21,24.7C68.6,53.8,80.7,42.1,80.7,32C80.7,32,80.7,31.9,80.7,32   C80.7,31.8,80.7,31.7,80.7,32z" 
    />
  </Svg>
);

const GoogleFitLogo = () => (
  <Image 
    source={require('../logos/7123947_google_fit_icon.png')} 
    style={{ width: 24, height: 24, resizeMode: 'contain' }} 
  />
);

const ZoomLogo = () => (
  <Svg width="24" height="24" viewBox="0 -0.22536098966569895 84.762 20.903060594657283">
    <Path 
      d="M69.012 6.414c.324.559.43 1.195.465 1.91l.046.953v6.664l.047.954c.094 1.558 1.243 2.71 2.813 2.808l.949.047V9.277l.047-.953c.039-.707.144-1.355.473-1.918a3.806 3.806 0 0 1 6.59.012c.324.559.425 1.207.464 1.906l.047.95v6.667l.047.954c.098 1.566 1.238 2.718 2.813 2.808l.949.047V8.324a7.62 7.62 0 0 0-7.617-7.62 7.6 7.6 0 0 0-5.715 2.581A7.61 7.61 0 0 0 65.715.703c-1.582 0-3.05.48-4.266 1.309-.742-.828-2.402-1.309-3.355-1.309V19.75l.953-.047c1.594-.105 2.746-1.226 2.808-2.808l.051-.954V9.277l.047-.953c.04-.719.14-1.351.465-1.914a3.816 3.816 0 0 1 3.297-1.898 3.81 3.81 0 0 1 3.297 1.902zM3.809 19.704l.953.046h14.285L19 18.8c-.129-1.566-1.238-2.71-2.809-2.812l-.953-.047h-8.57l11.426-11.43-.047-.949C17.973 1.98 16.817.837 15.238.75l-.953-.043L0 .703l.047.953c.125 1.551 1.25 2.719 2.808 2.809l.954.047h8.57L.953 15.942l.047.953c.094 1.57 1.227 2.707 2.809 2.808zM54.355 3.491a9.523 9.523 0 0 1 0 13.469 9.53 9.53 0 0 1-13.472 0c-3.719-3.719-3.719-9.75 0-13.469a9.518 9.518 0 0 1 6.73-2.789 9.525 9.525 0 0 1 6.742 2.79zM51.66 6.188a5.717 5.717 0 0 1 0 8.082 5.717 5.717 0 0 1-8.082 0 5.717 5.717 0 0 1 0-8.082 5.717 5.717 0 0 1 8.082 0zM27.625.702a9.518 9.518 0 0 1 6.73 2.79c3.72 3.718 3.72 9.75 0 13.468a9.53 9.53 0 0 1-13.472 0c-3.719-3.719-3.719-9.75 0-13.469a9.518 9.518 0 0 1 6.73-2.789h.012zm4.035 5.484a5.717 5.717 0 0 1 0 8.083 5.717 5.717 0 0 1-8.082 0 5.717 5.717 0 0 1 0-8.082 5.717 5.717 0 0 1 8.082 0z" 
      fill="#2D8CFF" 
      fillRule="evenodd"
    />
  </Svg>
);

const GoogleMeetLogo = () => (
  <Svg width="24" height="24" viewBox="0 0 87.51 72">
    <Path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z"/>
    <Path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"/>
    <Path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z"/>
    <Path fill="#2684fc" d="M20.5 20.5H0v31h20.5z"/>
    <Path fill="#00ac47" d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z"/>
    <Path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z"/>
  </Svg>
);

const TeamsLogo = () => (
  <Svg width="24" height="24" viewBox="-0.12979372698077785 0 32.42343730730004 32">
    <Circle cx="17" cy="6" fill="#7b83eb" r="4.667"/>
    <Path d="M16.667 7H12.44l.021.093.002.008.022.086A4.671 4.671 0 0 0 18 10.559V8.333A1.337 1.337 0 0 0 16.667 7z" opacity="0.1"/>
    <Path d="M15.667 8h-2.884A4.667 4.667 0 0 0 17 10.667V9.333A1.337 1.337 0 0 0 15.667 8z" opacity="0.2"/>
    <Circle cx="27.5" cy="7.5" fill="#5059c9" r="3.5"/>
    <Path d="M30.5 12h-7.861a.64.64 0 0 0-.64.64v8.11a5.121 5.121 0 0 0 3.967 5.084A5.006 5.006 0 0 0 32 20.938V13.5a1.5 1.5 0 0 0-1.5-1.5z" fill="#5059c9"/>
    <Path d="M25 13.5V23a7.995 7.995 0 0 1-14.92 4 7.173 7.173 0 0 1-.5-1 8.367 8.367 0 0 1-.33-1A8.24 8.24 0 0 1 9 23v-9.5a1.498 1.498 0 0 1 1.5-1.5h13a1.498 1.498 0 0 1 1.5 1.5z" fill="#7b83eb"/>
    <Path d="M15.667 8h-2.884A4.667 4.667 0 0 0 17 10.667V9.333A1.337 1.337 0 0 0 15.667 8z" opacity="0.2"/>
    <Path d="M18 12v12.67a1.32 1.32 0 0 1-1.04 1.29.966.966 0 0 1-.29.04H9.58a8.367 8.367 0 0 1-.33-1A8.24 8.24 0 0 1 9 23v-9.5a1.498 1.498 0 0 1 1.5-1.5z" opacity="0.1"/>
    <Path d="M17 12v13.67a.967.967 0 0 1-.04.29A1.32 1.32 0 0 1 15.67 27h-5.59a7.173 7.173 0 0 1-.5-1 8.367 8.367 0 0 1-.33-1A8.24 8.24 0 0 1 9 23v-9.5a1.498 1.498 0 0 1 1.5-1.5z" opacity="0.2"/>
    <Path d="M17 12v11.67A1.336 1.336 0 0 1 15.67 25H9.25A8.24 8.24 0 0 1 9 23v-9.5a1.498 1.498 0 0 1 1.5-1.5z" opacity="0.2"/>
    <Path d="M10.5 12A1.498 1.498 0 0 0 9 13.5V23a8.24 8.24 0 0 0 .25 2h5.42A1.336 1.336 0 0 0 16 23.67V12z" opacity="0.2"/>
    <Path d="M1.333 8h13.334A1.333 1.333 0 0 1 16 9.333v13.334A1.333 1.333 0 0 1 14.667 24H1.333A1.333 1.333 0 0 1 0 22.667V9.333A1.333 1.333 0 0 1 1.333 8z" fill="#4b53bc"/>
    <Path d="M11.98 12.975H8.99v8.02H7.028v-8.02H4.02v-1.97h7.96z" fill="#fff"/>
    <Path d="M0 0h32v32H0z" fill="none"/>
  </Svg>
);

interface App {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  userInfo?: {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
  };
}

const APPS: App[] = [
  { id: 'gcal', name: 'Google Calendar', icon: 'google', connected: false },
  { id: 'outlook', name: 'Outlook Calendar', icon: 'outlook', connected: false },
  { id: 'slack', name: 'Slack', icon: 'slack', connected: false },
  { id: 'asana', name: 'Asana', icon: 'asana', connected: false },
  { id: 'clickup', name: 'ClickUp', icon: 'clickup', connected: false },
  { id: 'apple-health', name: 'Apple Health', icon: 'apple-health', connected: false },
  { id: 'google-fit', name: 'Google Fit', icon: 'google-fit', connected: false },
  { id: 'zoom', name: 'Zoom', icon: 'zoom', connected: false },
  { id: 'meet', name: 'Google Meet', icon: 'google-meet', connected: false },
  { id: 'teams', name: 'Microsoft Teams', icon: 'teams', connected: false },
];

export default function ConnectAppsScreen() {
  const [apps, setApps] = useState<App[]>(APPS);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load connection statuses when component mounts
    loadConnectionStatuses();
  }, []);

  const loadConnectionStatuses = async () => {
    try {
      const updatedApps = await Promise.all(
        APPS.map(async (app) => {
          const status = await OAuthService.getConnectionStatus(app.id);
          return {
            ...app,
            connected: status.connected,
            userInfo: status.userInfo,
          };
        })
      );
      setApps(updatedApps);
    } catch (error) {
      console.error('Error loading connection statuses:', error);
    }
  };

  const handleConnect = async (appId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsLoading(true);

      const app = apps.find(a => a.id === appId);
      if (!app) return;

      if (app.connected) {
        // Handle disconnect
        Alert.alert(
          'Disconnect App',
          `Are you sure you want to disconnect ${app.name}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disconnect',
              style: 'destructive',
              onPress: async () => {
                await OAuthService.disconnect(appId);
                await loadConnectionStatuses();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              },
            },
          ]
        );
        return;
      }

      // Handle connect
      const result = await OAuthService.authenticate(appId);
      
      if (result.success) {
        Alert.alert(
          'Success!',
          `${app.name} has been connected successfully.`,
          [{ text: 'OK', onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) }]
        );
        await loadConnectionStatuses();
      } else {
        Alert.alert(
          'Connection Failed',
          result.error || `Failed to connect ${app.name}. Please try again.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error(`Error handling connection for ${appId}:`, error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case 'google':
        return <GoogleLogo />;
      case 'outlook':
        return <OutlookLogo />;
      case 'apple':
        return <AppleLogo />;
      case 'slack':
        return <SlackLogo />;
      case 'asana':
        return <AsanaLogo />;
      case 'clickup':
        return <ClickUpLogo />;
      case 'apple-health':
        return <AppleHealthLogo />;
      case 'google-fit':
        return <GoogleFitLogo />;
      case 'zoom':
        return <ZoomLogo />;
      case 'google-meet':
        return <GoogleMeetLogo />;
      case 'teams':
        return <TeamsLogo />;
      default:
        return <GoogleLogo />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Connect your apps</Text>
        <Text style={styles.subtitle}>
          Connect the apps you use to get personalized insights
        </Text>
        
        {apps.filter(app => app.connected).length > 0 && (
          <View style={styles.connectedCountContainer}>
            <Text style={styles.connectedCountText}>
              {apps.filter(app => app.connected).length} app{apps.filter(app => app.connected).length !== 1 ? 's' : ''} connected
            </Text>
          </View>
        )}
        
        <ScrollView 
          style={styles.appsContainer} 
          contentContainerStyle={styles.appsScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {apps.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.appRow}
              onPress={() => handleConnect(app.id)}
              disabled={isLoading}
            >
              <View style={styles.appInfo}>
                <View style={styles.appIcon}>
                  {renderIcon(app.icon)}
                </View>
                <View style={styles.appDetails}>
                  <Text style={styles.appName}>{app.name}</Text>
                  {app.connected && app.userInfo?.email && (
                    <Text style={styles.userEmail}>{app.userInfo.email}</Text>
                  )}
                </View>
              </View>
              
              <View style={[
                styles.connectButton,
                app.connected && styles.connectedButton,
                isLoading && styles.disabledButton
              ]}>
                <Text style={[
                  styles.connectButtonText,
                  app.connected && styles.connectedButtonText
                ]}>
                  {isLoading ? '...' : (app.connected ? 'Connected' : 'Connect')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/loading');
            }}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/loading');
            }}
            disabled={isLoading}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 10,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  appsContainer: {
    flex: 1,
    marginBottom: 24,
    width: '100%',
  },
  appsScrollContent: {
    alignItems: 'center',
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
    textAlign: 'left',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  connectedButton: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  connectedButtonText: {
    color: '#FFFFFF',
  },
  footer: {
    paddingTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  skipButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#007AFF',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  connectedCountContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  connectedCountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
}); 
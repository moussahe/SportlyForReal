import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
  Keyboard,
  Alert
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { AppDispatch, RootState } from '../../store/store';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import colors from '../../theme/colors';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Main: undefined;
};

type LoginNavigationProp = StackNavigationProp<AuthStackParamList>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const logoScale = useRef(new Animated.Value(1)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  
  const navigation = useNavigation<LoginNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Gérer l'affichage/masquage du clavier
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    // Animation d'entrée
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Traiter les erreurs
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur de connexion', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  // Redirection si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }]
      });
    }
  }, [isAuthenticated, navigation]);

  const handleLogin = () => {
    if (email.trim() === '' || password === '') {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs');
      return;
    }
    dispatch(login({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Animated.Image 
            source={require('../../../assets/sportly-logo-1.png')} 
            style={[
              styles.logo, 
              { transform: [{ scale: logoScale }] }
            ]} 
            resizeMode="contain" 
          />
          <Text style={styles.taglineText}>Trouvez votre équipe</Text>
        </View>

        <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
          <Text style={styles.welcomeText}>Bienvenue</Text>
          <Text style={styles.loginText}>Connexion à votre compte</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={22} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={colors.text.light}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={colors.text.light}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Google login')}>
              <FontAwesome name="google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.socialButton} onPress={() => console.log('Apple login')}>
              <FontAwesome name="apple" size={22} color="#000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28, // Augmenté de 24 à 28
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 26, // Réduit de 30 à 26
  },
  logo: {
    width: 100, // Réduit de 110 à 100
    height: 100, // Réduit de 110 à 100
    backgroundColor: 'transparent',
  },
  appNameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 8,
  },
  taglineText: {
    fontSize: 15, // Réduit de 16 à 15
    color: colors.text.secondary,
    marginTop: 6, // Augmenté de 4 à 6
    fontWeight: '500', // Ajout d'un peu de poids
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    borderRadius: 10, // Réduit de 12 à 10
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 52, // Réduit de 56 à 52
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 }, // Ombre plus subtile
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1, // Ombre plus subtile sur Android
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    height: '100%',
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 44, // Réduit de 48 à 44
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 }, // Ombre moins prononcée
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 15, // Réduit de 16 à 15
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 4,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    color: colors.text.secondary,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  signupButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
    borderRadius: 10,
    height: 44, // Réduit de 48 à 44
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    color: colors.primary,
    fontSize: 15, // Réduit de 16 à 15
    fontWeight: '600',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.white,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 20,
    width: '48%',
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    color: colors.text.primary,
  },
});

export default LoginScreen;

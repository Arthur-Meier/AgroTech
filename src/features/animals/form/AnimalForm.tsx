import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import type { RootStackParamList } from '@/app/navigation';
import { countAnimals, getAnimalById, listAnimals, upsertAnimal } from '@/data/animal.repo';
import type { Animal, AnimalOrigin, AnimalType, Sex } from '@/domain/animal';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { t } from '@/core/i18n/strings';
import { useEntitlement } from '@/core/iap/entitlements';
import { canCreateAnimal } from '@/core/product/limits';
import { captureError } from '@/core/observability/sentry';
import AppButton from '@/ui/components/AppButton';

type FormRoute = RouteProp<RootStackParamList, 'AnimalForm'>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;

const ORIGIN_OPTIONS: { labelKey: string; value: AnimalOrigin }[] = [
  { labelKey: 'animalForm.origin.option.birth', value: 'BIRTH' },
  { labelKey: 'animalForm.origin.option.purchase', value: 'PURCHASE' },
  { labelKey: 'animalForm.origin.option.transfer', value: 'TRANSFER' },
];

function normalizeOrigin(input?: string): AnimalOrigin {
  const normalized = input?.trim().toUpperCase();
  if (normalized === 'BIRTH' || normalized === 'NASCIMENTO') return 'BIRTH';
  if (normalized === 'TRANSFER' || normalized === 'TRANSFERENCIA') return 'TRANSFER';
  return 'PURCHASE';
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toIsoDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value?: string): Date | null {
  if (!value || !isIsoDate(value)) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmentRow}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <AppButton
            key={option.value}
            label={option.label}
            onPress={() => onChange(option.value)}
            kind={active ? 'primary' : 'secondary'}
            style={styles.segmentItem}
          />
        );
      })}
    </View>
  );
}

function Field({
  label,
  children,
  containerStyle,
}: {
  label: string;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();
  return (
    <View style={containerStyle}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>{label}</Text>
      {children}
    </View>
  );
}

function Input({
  multiline = false,
  style,
  ...props
}: React.ComponentProps<typeof TextInput> & { multiline?: boolean }) {
  const theme = useAppTheme();

  return (
    <TextInput
      placeholderTextColor={theme.colors.textMuted}
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.text,
          minHeight: multiline ? 96 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        },
        style,
      ]}
      multiline={multiline}
      {...props}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.selectContainer,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Picker selectedValue={value} onValueChange={(nextValue) => onChange(String(nextValue))}>
        <Picker.Item label={placeholder ?? t('animalForm.parent.placeholder')} value="" />
        {options.map((option) => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
    </View>
  );
}

export default function AnimalForm() {
  const theme = useAppTheme();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<FormRoute>();
  const insets = useSafeAreaInsets();
  const { entitlement } = useEntitlement();

  const id = route.params?.id;
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

  // Parent candidates are loaded from existing records and filtered by sex.
  const [availableAnimals, setAvailableAnimals] = useState<Animal[]>([]);

  const [tag, setTag] = useState('');
  const [type, setType] = useState<AnimalType>('BEZERRO');
  const [sex, setSex] = useState<Sex>('F');
  const [breed, setBreed] = useState('');
  const [origin, setOrigin] = useState<AnimalOrigin>('PURCHASE');
  const [birthDate, setBirthDate] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [sireTag, setSireTag] = useState('');
  const [damTag, setDamTag] = useState('');
  const [notes, setNotes] = useState('');

  const birthDateValue = useMemo(() => parseIsoDate(birthDate) ?? new Date(), [birthDate]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [animals, existingAnimal] = await Promise.all([
          listAnimals(),
          id ? getAnimalById(id) : Promise.resolve(undefined),
        ]);

        if (!mounted) return;

        setAvailableAnimals(animals.filter((animal) => animal.id !== id));

        if (!existingAnimal) {
          setLoading(false);
          return;
        }

        setTag(existingAnimal.tag);
        setType(existingAnimal.type);
        setSex(existingAnimal.sex);
        setBreed(existingAnimal.breed ?? '');
        setOrigin(normalizeOrigin(existingAnimal.origin));
        setBirthDate(existingAnimal.birthDate ?? '');
        setWeightKg(existingAnimal.weightKg != null ? String(existingAnimal.weightKg) : '');
        setSireTag(existingAnimal.sireTag ?? '');
        setDamTag(existingAnimal.damTag ?? '');
        setNotes(existingAnimal.notes ?? '');
      } catch (error) {
        captureError(error, { scope: 'animal_form_prefill' });
        Alert.alert(t('validation.title'), t('animals.error.load'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const maleParentOptions = useMemo(
    () => availableAnimals.filter((animal) => animal.sex === 'M').map((animal) => ({ label: animal.tag, value: animal.tag })),
    [availableAnimals]
  );

  const femaleParentOptions = useMemo(
    () => availableAnimals.filter((animal) => animal.sex === 'F').map((animal) => ({ label: animal.tag, value: animal.tag })),
    [availableAnimals]
  );

  const isBirthOrigin = origin === 'BIRTH';

  const contentPaddingBottom = useMemo(() => insets.bottom + 24, [insets.bottom]);

  function onBirthDateChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === 'android') {
      setShowBirthDatePicker(false);
      if (event.type === 'dismissed') return;
    }

    if (nextDate) {
      setBirthDate(toIsoDate(nextDate));
    }
  }

  async function save() {
    if (!tag.trim()) {
      Alert.alert(t('validation.title'), t('animalForm.validation.tag'));
      return;
    }

    if (birthDate.trim() && !isIsoDate(birthDate.trim())) {
      Alert.alert(t('validation.title'), t('animalForm.validation.birthDate'));
      return;
    }

    const normalizedWeight = weightKg.trim() ? Number(weightKg) : undefined;
    if (weightKg.trim() && Number.isNaN(normalizedWeight)) {
      Alert.alert(t('validation.title'), t('animalForm.validation.weight'));
      return;
    }

    if (isBirthOrigin) {
      if (!sireTag.trim() || !damTag.trim()) {
        Alert.alert(t('validation.title'), t('animalForm.validation.parentsRequired'));
        return;
      }

      const sireExists = maleParentOptions.some((option) => option.value === sireTag);
      const damExists = femaleParentOptions.some((option) => option.value === damTag);
      if (!sireExists || !damExists) {
        Alert.alert(t('validation.title'), t('animalForm.validation.parentsRequired'));
        return;
      }
    }

    if (!isEditing) {
      const currentCount = await countAnimals();
      if (!canCreateAnimal(entitlement, currentCount)) {
        Alert.alert(t('validation.title'), t('animals.createBlocked'));
        navigation.navigate('Paywall', { source: 'animal_form_save' });
        return;
      }
    }

    setSaving(true);
    try {
      await upsertAnimal({
        id,
        tag,
        type,
        sex,
        breed,
        origin,
        birthDate,
        weightKg: normalizedWeight,
        sireTag,
        damTag,
        notes,
      });

      Alert.alert('OK', t('animalForm.saved'));
      navigation.goBack();
    } catch (error) {
      captureError(error, { scope: 'animal_form_save' });
      const message =
        error instanceof Error && error.message === 'INVALID_DATE_FORMAT'
          ? t('animalForm.validation.birthDate')
          : t('animals.error.load');
      Alert.alert(t('validation.title'), message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={16}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentPaddingBottom }]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        <Field label={t('animalForm.tag.label')}>
          <Input value={tag} onChangeText={setTag} placeholder={t('animalForm.tag.placeholder')} returnKeyType="next" />
        </Field>

        <Field label={t('animalForm.type.label')}>
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { label: 'Bezerro', value: 'BEZERRO' },
              { label: 'Novilho', value: 'NOVILHO' },
              { label: 'Matriz', value: 'MATRIZ' },
              { label: 'Engorda', value: 'ENGORDA' },
            ]}
          />
        </Field>

        <Field label={t('animalForm.sex.label')}>
          <Segmented
            value={sex}
            onChange={setSex}
            options={[
              { label: 'Femea', value: 'F' },
              { label: 'Macho', value: 'M' },
            ]}
          />
        </Field>

        <Field label={t('animalForm.breed.label')}>
          <Input value={breed} onChangeText={setBreed} placeholder="Ex.: Angus" returnKeyType="next" />
        </Field>

        <Field label={t('animalForm.origin.label')}>
          <SelectInput
            value={origin}
            onChange={(next) => setOrigin(normalizeOrigin(next))}
            options={ORIGIN_OPTIONS.map((option) => ({
              label: t(option.labelKey),
              value: option.value,
            }))}
          />
          <Text style={[styles.fieldHelp, { color: theme.colors.textMuted }]}> 
            {isBirthOrigin ? t('animalForm.origin.help.birth') : t('animalForm.origin.help.external')}
          </Text>
        </Field>

        <Field label={t('animalForm.birthDate.label')}>
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              setShowBirthDatePicker((current) => !current);
            }}
            style={[
              styles.dateTrigger,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={{ color: birthDate ? theme.colors.text : theme.colors.textMuted }}>
              {birthDate || t('animalForm.birthDate.select')}
            </Text>
          </Pressable>

          {showBirthDatePicker ? (
            <DateTimePicker
              value={birthDateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onBirthDateChange}
            />
          ) : null}
        </Field>

        <Field label={t('animalForm.weight.label')}>
          <Input value={weightKg} onChangeText={setWeightKg} placeholder="Ex.: 340" keyboardType="numeric" />
        </Field>

        <View style={styles.doubleColumn}>
          <Field label={t('animalForm.sireTag.label')} containerStyle={styles.columnField}>
            {isBirthOrigin ? (
              <>
                <SelectInput value={sireTag} onChange={setSireTag} options={maleParentOptions} />
                {maleParentOptions.length === 0 ? (
                  <Text style={[styles.fieldHelp, { color: theme.colors.danger }]}>{t('animalForm.parent.noMale')}</Text>
                ) : null}
              </>
            ) : (
              <Input value={sireTag} onChangeText={setSireTag} placeholder="Ex.: P-001" />
            )}
          </Field>

          <Field label={t('animalForm.damTag.label')} containerStyle={styles.columnField}>
            {isBirthOrigin ? (
              <>
                <SelectInput value={damTag} onChange={setDamTag} options={femaleParentOptions} />
                {femaleParentOptions.length === 0 ? (
                  <Text style={[styles.fieldHelp, { color: theme.colors.danger }]}>{t('animalForm.parent.noFemale')}</Text>
                ) : null}
              </>
            ) : (
              <Input value={damTag} onChangeText={setDamTag} placeholder="Ex.: M-001" />
            )}
          </Field>
        </View>

        <Field label={t('animalForm.notes.label')}>
          <Input value={notes} onChangeText={setNotes} placeholder="Notas gerais" multiline />
        </Field>

        <View style={styles.footerActions}>
          <AppButton
            label={isEditing ? t('app.save') : t('app.create')}
            onPress={save}
            loading={saving || loading}
            fullWidth
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldHelp: {
    fontSize: 12,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  selectContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateTrigger: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentItem: {
    flex: 1,
    minWidth: 120,
  },
  doubleColumn: {
    flexDirection: 'row',
    gap: 8,
  },
  columnField: {
    flex: 1,
  },
  footerActions: {
    marginTop: 4,
  },
});

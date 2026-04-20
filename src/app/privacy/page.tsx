import Link from "next/link";

export const metadata = {
  title: "Политика конфиденциальности — DropFilesKgpk",
  description: "Политика обработки персональных данных сервиса DropFilesKgpk",
};

export default function PrivacyPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dropfileskgpk.vercel.app";

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            📂 DropFiles<span className="text-blue-500">Kgpk</span>
          </Link>
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← На главную
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-fadeIn">
          <h1 className="text-3xl font-bold mb-2">Политика конфиденциальности</h1>
          <p className="text-zinc-500 mb-8">
            Политика обработки персональных данных сервиса DropFilesKgpk
          </p>

          <div className="text-sm text-zinc-500 mb-10 space-y-1">
            <p>Дата вступления в силу: {new Date().toLocaleDateString("ru-RU")}</p>
            <p>Дата последнего обновления: {new Date().toLocaleDateString("ru-RU")}</p>
            <p>Версия: 1.0</p>
          </div>

          {/* Section 1 */}
          <Section number="1" title="Общие положения">
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты
              персональных данных пользователей (далее — «Пользователи») сервиса
              DropFilesKgpk (далее — «Сервис»), расположенного в сети Интернет
              по адресу: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-blue-400">{siteUrl}</code> (далее — «Сайт»).
            </p>
            <p>
              Сервис DropFilesKgpk (далее — «Оператор») обеспечивает защиту обрабатываемых
              персональных данных в соответствии с законодательством Российской Федерации,
              включая Федеральный закон от 27.07.2006 № 152-ФЗ «О персональных данных»
              (далее — ФЗ-152).
            </p>
            <p>
              Использование Сайта означает безоговорочное согласие Пользователя с настоящей
              Политикой и указанными в ней условиями обработки его персональных данных.
              В случае несогласия Пользователь обязан воздержаться от использования Сайта.
            </p>
          </Section>

          {/* Section 2 */}
          <Section number="2" title="Сведения об операторе">
            <p>
              Оператором персональных данных является владелец и администратор сервиса DropFilesKgpk
              (далее — «Оператор»):
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1 text-sm">
              <p><span className="text-zinc-400">Наименование:</span> DropFilesKgpk (DFK)</p>
              <p><span className="text-zinc-400">Тип:</span> Физическое лицо</p>
              <p><span className="text-zinc-400">Email для обращений:</span> freskafreskov@gmail.com</p>
              <p><span className="text-zinc-400">Адрес:</span> г. Курск, Российская Федерация</p>
            </div>
          </Section>

          {/* Section 3 */}
          <Section number="3" title="Цели сбора персональных данных">
            <p>Оператор обрабатывает персональные данные Пользователя в следующих целях:</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Идентификация</strong> — регистрация и авторизация Пользователя на Сайте, создание и управление учётной записью</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Предоставление услуг</strong> — загрузка, хранение и обмен файлами, управление доступом к файлам</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Безопасность</strong> — двухфакторная аутентификация, подтверждение email, предотвращение несанкционированного доступа</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Коммуникация</strong> — отправка уведомлений, кодов подтверждения, информирование об изменениях в работе Сервиса</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Аналитика</strong> — улучшение качества Сервиса, анализ использования, устранение ошибок</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Квотирование</strong> — контроль объёма хранимых данных в рамках установленных лимитов</span>
              </li>
            </ul>
          </Section>

          {/* Section 4 */}
          <Section number="4" title="Перечень собираемых данных">
            <p>Оператор обрабатывает следующие персональные данные Пользователя:</p>
            <div className="space-y-3">
              <DataCategory icon="👤" title="Данные аккаунта">
                <li>Адрес электронной почты (email)</li>
                <li>Имя (указывается Пользователем добровольно)</li>
                <li>Хэш пароля (пароль хранится только в зашифрованном виде, bcrypt)</li>
              </DataCategory>
              <DataCategory icon="🔐" title="Данные аутентификации">
                <li>Коды подтверждения (email-коды для регистрации и 2FA)</li>
                <li>JWT-токены сессий</li>
              </DataCategory>
              <DataCategory icon="📂" title="Данные файлов">
                <li>Имена загружаемых файлов</li>
                <li>Размер и тип файлов (MIME-type)</li>
                <li>Дата и время загрузки</li>
                <li>Настройки доступа к файлам</li>
              </DataCategory>
              <DataCategory icon="🌐" title="Технические данные">
                <li>IP-адрес (фиксируется веб-сервером автоматически)</li>
                <li>Файлы cookie (используются для управления сессиями)</li>
                <li>Данные о браузере и устройстве (User-Agent)</li>
                <li>Дата и время доступа к Сайту</li>
              </DataCategory>
            </div>
          </Section>

          {/* Section 5 */}
          <Section number="5" title="Правовые основания обработки">
            <p>
              Оператор обрабатывает персональные данные Пользователя на основании:
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Согласия субъекта персональных данных, выражаемого в виде совершения конклюдентных действий (регистрация на Сайте, использование Сервиса)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Необходимости исполнения договора, стороной которого является субъект персональных данных</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»</span>
              </li>
            </ul>
          </Section>

          {/* Section 6 */}
          <Section number="6" title="Права пользователей">
            <p>В соответствии с ФЗ-152, Пользователь имеет право:</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Получать информацию</strong> о факте обработки своих персональных данных, их источнике и целях</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Доступ к данным</strong> — просматривать, редактировать и скачивать свои данные через настройки аккаунта</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Исправление</strong> — требовать уточнения и исправления неточных или неполных персональных данных</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Отзыв согласия</strong> — отозвать согласие на обработку персональных данных, направив запрос на email: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-blue-400">freskafreskov@gmail.com</code></span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Удаление данных</strong> — требовать удаления своих персональных данных (удаление аккаунта влечёт удаление всех связанных данных)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Обжалование</strong> — обжаловать действия или бездействие Оператора в уполномоченный орган по защите прав субъектов персональных данных (Роскомнадзор) или в судебном порядке</span>
              </li>
            </ul>
            <p className="text-sm text-zinc-400 mt-3">
              Для реализации прав Пользователь может обратиться к Оператору по адресу
              электронной почты <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-blue-400">noreply@dfk.local</code>.
              Оператор обязуется рассмотреть обращение в течение 30 (тридцати) рабочих дней.
            </p>
          </Section>

          {/* Section 7 */}
          <Section number="7" title="Меры защиты персональных данных">
            <p>Оператор принимает необходимые и достаточные организационные и технические меры для защиты персональных данных:</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">🔒</span>
                <span><strong>Шифрование паролей:</strong> пароли хранятся исключительно в виде криптографического хэша (bcrypt с «солью»), восстановление исходного пароля невозможно</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">🔑</span>
                <span><strong>JWT-сессии:</strong> аутентификация осуществляется на основе подписанных JSON Web Token с ограниченным сроком действия</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">🛡️</span>
                <span><strong>Двухфакторная аутентификация:</strong> Пользователи могут дополнительно защитить аккаунт через подтверждение входа кодом на email</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">📦</span>
                <span><strong>Безопасное хранение файлов:</strong> оригинальные имена файлов заменяются на UUID при сохранении на диск, прямая ссылка на файл без проверки прав невозможна</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">🔐</span>
                <span><strong>Контроль доступа:</strong> каждый файл имеет три уровня доступа (приватный, по ссылке, публичный); скачивание возможно только после проверки прав</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">👥</span>
                <span><strong>Ограничение доступа персонала:</strong> доступ к данным имеют только уполномоченные лица (администратор)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">✅</span>
                <span><strong>Валидация данных:</strong> проверяются MIME-типы, расширения и размеры загружаемых файлов</span>
              </li>
            </ul>
          </Section>

          {/* Section 8 */}
          <Section number="8" title="Порядок и сроки хранения данных">
            <p>
              Персональные данные Пользователя хранятся до достижения целей обработки или
              до момента отзыва согласия. Конкретные сроки:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-800/50 text-zinc-400">
                  <tr>
                    <th className="text-left px-4 py-3">Тип данных</th>
                    <th className="text-left px-4 py-3">Срок хранения</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  <tr>
                    <td className="px-4 py-3">Данные аккаунта</td>
                    <td className="px-4 py-3 text-zinc-400">До удаления аккаунта</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Файлы Пользователя</td>
                    <td className="px-4 py-3 text-zinc-400">До удаления Пользователем или Оператором</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Коды подтверждения</td>
                    <td className="px-4 py-3 text-zinc-400">10 минут (для 2FA — 5 минут)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Секретные ссылки</td>
                    <td className="px-4 py-3 text-zinc-400">До истечения срока или отзыва</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Журналы (IP, логи)</td>
                    <td className="px-4 py-3 text-zinc-400">Не более 12 месяцев</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-zinc-400 mt-3">
              После удаления аккаунта все персональные данные Пользователя, включая файлы,
              настройки и записи в базе данных, удаляются безвозвратно в течение 30 (тридцати) дней.
              Файлы, доступные по публичным ссылкам, удаляются одновременно с аккаунтом.
            </p>
          </Section>

          {/* Section 9 */}
          <Section number="9" title="Передача данных третьим лицам">
            <p>
              Оператор не передаёт персональные данные Пользователей третьим лицам, за исключением:
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Случаев, предусмотренных законодательством Российской Федерации (по запросу уполномоченных органов)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>С согласия Пользователя (например, при предоставлении доступа к файлам другим пользователям)</span>
              </li>
            </ul>
            <p>
              Оператор не продаёт, не обменивает и не раскрывает персональные данные
              Пользователей в коммерческих целях.
            </p>
          </Section>

          {/* Section 10 */}
          <Section number="10" title="Использование файлов cookie">
            <p>
              Сайт использует файлы cookie исключительно для обеспечения функциональности:
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Сессионные cookie</strong> — для аутентификации и поддержания сессии Пользователя</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span><strong>Настройки темы</strong> — сохранение выбранной темы (тёмная/светлая) в localStorage</span>
              </li>
            </ul>
            <p>
              Сайт не использует cookie для отслеживания поведения Пользователя,
              таргетированной рекламы или передачи данных аналитическим системам третьих сторон.
              Пользователь может отключить cookie в настройках браузера, однако это может
              повлиять на работоспособность Сайта.
            </p>
          </Section>

          {/* Section 11 */}
          <Section number="11" title="Изменение политики конфиденциальности">
            <p>
              Оператор вправе вносить изменения в настоящую Политику конфиденциальности
              в одностороннем порядке. Новая редакция вступает в силу с момента её
              размещения на Сайте. Пользователь обязуется самостоятельно отслеживать
              изменения, просматривая актуальную версию по адресу:
            </p>
            <p className="text-blue-400 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 inline-block">
              {siteUrl}/privacy
            </p>
            <p className="text-sm text-zinc-400 mt-2">
              При существенных изменениях Оператор может уведомить Пользователей
              через email или баннер на Сайте.
            </p>
          </Section>

          {/* Section 12 */}
          <Section number="12" title="Контактная информация">
            <p>
              По всем вопросам, связанным с обработкой персональных данных,
              Пользователь может обратиться:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 text-sm">
              <p><span className="text-zinc-400">Email:</span> freskafreskov@gmail.com</p>
              <p><span className="text-zinc-400">Адрес Сайта:</span> {siteUrl}</p>
              <p><span className="text-zinc-400">Адрес оператора:</span> г. Курск, Российская Федерация</p>
              <p><span className="text-zinc-400">Срок ответа:</span> не более 30 рабочих дней</p>
            </div>
            <p className="text-sm text-zinc-500 mt-4">
              Вы также вправе направить жалобу в Роскомнадзор —
              <a href="https://rkn.gov.ru" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                rkn.gov.ru
              </a>
            </p>
          </Section>

          {/* Footer note */}
          <div className="mt-12 pt-6 border-t border-zinc-800 text-center text-sm text-zinc-500">
            <p>
              Документ составлен в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
              «О персональных данных»
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// ===================== SECTION COMPONENT =====================

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 animate-fadeIn">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-bold">
          {number}
        </span>
        {title}
      </h2>
      <div className="text-zinc-300 space-y-3 leading-relaxed pl-11">
        {children}
      </div>
    </section>
  );
}

// ===================== DATA CATEGORY =====================

function DataCategory({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h4 className="font-medium mb-2 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h4>
      <ul className="text-sm text-zinc-400 space-y-1 pl-6">
        {children}
      </ul>
    </div>
  );
}

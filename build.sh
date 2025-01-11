cd Backend
ls
source env/bin/activate
cd MyPortfolio
pip install -r requirements.txt

echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate
echo "Migration Done"

python manage.py collectstatic

ls
python manage.py runserver

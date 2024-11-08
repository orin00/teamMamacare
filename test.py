import json

# 파일 경로 지정
file_path = './hospital.json'

# JSON 파일 읽기
with open(file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# 중복 검사 및 제거
unique_hospitals = []
seen = set()

for hospital in data['hospitals']:
    # 중복 체크 기준: 병원의 이름과 주소를 조합하여 검사
    unique_identifier = (hospital['name'], hospital['address'])
    
    if unique_identifier not in seen:
        seen.add(unique_identifier)
        unique_hospitals.append(hospital)

# 중복이 제거된 데이터를 다시 저장
data['hospitals'] = unique_hospitals

# JSON 파일에 쓰기
with open(file_path, 'w', encoding='utf-8') as file:
    json.dump(data, file, ensure_ascii=False, indent=4)

print(f"중복 제거 후 병원 개수: {len(unique_hospitals)}")
